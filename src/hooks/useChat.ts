import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import type { Message, ChatUser } from '../context/ChatContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  getDoc, 
  onSnapshot,
  orderBy,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export function useChats() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chats, setChats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();
  const { data, dispatch } = useChat();

  // Get user chats
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    const unsubscribe = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
      if (doc.exists()) {
        setChats(doc.data());
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Search for users
  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const q = query(
        collection(db, "users"),
        where("displayName", ">=", searchTerm),
        where("displayName", "<=", searchTerm + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      
      const usersArr: ChatUser[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as ChatUser;
        if (userData.uid !== currentUser?.uid) {
          usersArr.push(userData);
        }
      });
      
      setUsers(usersArr);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Select user to chat with
  const selectUser = async (user: ChatUser) => {
    setSearchTerm('');
    setUsers([]);
    
    if (!currentUser) return;

    try {
      const combinedId =
        user.uid > currentUser.uid
          ? currentUser.uid + user.uid
          : user.uid + currentUser.uid;

      const chatDocRef = doc(db, "chats", combinedId);
      const chatDoc = await getDoc(chatDocRef);

      if (!chatDoc.exists()) {
        // Create chat document if it doesn't exist
        await setDoc(chatDocRef, { messages: [] });

        // Update both users' userChats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [`${combinedId}`]: {
            userInfo: {
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
              email: user.email
            },
            date: serverTimestamp(),
          },
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [`${combinedId}`]: {
            userInfo: {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              email: currentUser.email
            },
            date: serverTimestamp(),
          },
        });
      }

      dispatch({ type: "CHANGE_USER", payload: user });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Get messages for the current chat
  useEffect(() => {
    if (data.chatId === 'null') return;
    
    const unsubscribe = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const messages = data.messages || [];
        dispatch({ type: "SET_MESSAGES", payload: messages });
      }
    });

    return () => unsubscribe();
  }, [data.chatId, dispatch]);

  // Send a message
  const sendMessage = async (text: string, img: File | null = null) => {
    if (!currentUser || !data.user) return;
    
    try {
      const messageId = uuid();
      const messageData: any = {
        id: messageId,
        text,
        senderId: currentUser.uid,
        date: Timestamp.now(),
      };

      // If there's an image, upload it first
      if (img) {
        const storage = getStorage();
        const storageRef = ref(storage, `chat/${data.chatId}/${messageId}`);
        
        const uploadTask = uploadBytesResumable(storageRef, img);
        
        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            setError(error.message);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Update message with image URL
            messageData.img = downloadURL;
            
            // Add message to chat document
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion(messageData)
            });

            // Update last message in userChats for both users
            await updateDoc(doc(db, "userChats", currentUser.uid), {
              [`${data.chatId}.lastMessage`]: {
                text: img ? "Image" : text,
                unsent: false
              },
              [`${data.chatId}.date`]: serverTimestamp()
            });

            await updateDoc(doc(db, "userChats", data.user.uid), {
              [`${data.chatId}.lastMessage`]: {
                text: img ? "Image" : text,
                unsent: false
              },
              [`${data.chatId}.date`]: serverTimestamp()
            });
          }
        );
      } else {
        // Add text message to chat document
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion(messageData)
        });

        // Update last message in userChats for both users
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [`${data.chatId}.lastMessage`]: {
            text,
            unsent: false
          },
          [`${data.chatId}.date`]: serverTimestamp()
        });

        await updateDoc(doc(db, "userChats", data.user.uid), {
          [`${data.chatId}.lastMessage`]: {
            text,
            unsent: false
          },
          [`${data.chatId}.date`]: serverTimestamp()
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Unsend a message
  const unsendMessage = async (messageId: string) => {
    if (!currentUser || !data.user || data.chatId === 'null') return;
    
    try {
      // Get current messages
      const chatDoc = await getDoc(doc(db, "chats", data.chatId));
      if (!chatDoc.exists()) return;
      
      const messages = chatDoc.data().messages;
      
      // Mark the message as unsent
      const updatedMessages = messages.map((msg: Message) => {
        if (msg.id === messageId && msg.senderId === currentUser.uid) {
          return { ...msg, unsent: true };
        }
        return msg;
      });
      
      // Update in Firestore
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: updatedMessages
      });
      
      // Update in local state
      dispatch({ type: "UNSEND_MESSAGE", payload: messageId });
      
      // Check if this was the last message and update if needed
      const lastMessage = chats[data.chatId]?.lastMessage;
      if (lastMessage && !lastMessage.unsent) {
        const lastMessageInChat = messages.findIndex((msg: Message) => msg.id === messageId);
        if (lastMessageInChat === messages.length - 1) {
          // This was the last message, update last message in userChats
          await updateDoc(doc(db, "userChats", currentUser.uid), {
            [`${data.chatId}.lastMessage.unsent`]: true
          });
          
          await updateDoc(doc(db, "userChats", data.user.uid), {
            [`${data.chatId}.lastMessage.unsent`]: true
          });
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    users,
    searchTerm, 
    setSearchTerm,
    chats,
    loading,
    error,
    handleSearch,
    selectUser,
    sendMessage,
    unsendMessage
  };
} 