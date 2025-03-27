import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { ChatUser } from '../context/ChatContext';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export function useAudioCall() {
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'receiving' | 'ongoing'>('idle');
  const [callError, setCallError] = useState<string | null>(null);
  const [remoteUser, setRemoteUser] = useState<ChatUser | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  const { currentUser } = useAuth();

  // Initialize WebRTC
  const initializeWebRTC = async () => {
    try {
      // Create peer connection with STUN servers
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      };
      
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      
      localStreamRef.current = stream;
      
      // Add local tracks to the connection
      stream.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, stream);
        }
      });
      
      // Set up event handlers for remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
        }
      };
      
      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && callId) {
          const candidateData = {
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            candidate: event.candidate.candidate
          };
          
          // Send candidate to the other peer via Firestore
          const callDocRef = doc(db, "calls", callId);
          updateDoc(callDocRef, {
            [`candidates.${currentUser?.uid}`]: candidateData,
            updatedAt: serverTimestamp()
          });
        }
      };
      
      return true;
    } catch (err: any) {
      setCallError(err.message || "Failed to access microphone");
      return false;
    }
  };
  
  // Clean up WebRTC resources
  const cleanupWebRTC = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    remoteStreamRef.current = null;
  };

  // Start a call
  const startCall = async (user: ChatUser) => {
    if (!currentUser) return;
    
    try {
      setCallError(null);
      setRemoteUser(user);
      
      // Generate a unique call ID
      const callId = `${currentUser.uid}_${user.uid}_${Date.now()}`;
      setCallId(callId);
      
      // Initialize WebRTC
      const initialized = await initializeWebRTC();
      if (!initialized) return;
      
      // Create call document in Firestore
      await setDoc(doc(db, "calls", callId), {
        callerId: currentUser.uid,
        callerName: currentUser.displayName,
        receiverId: user.uid,
        receiverName: user.displayName,
        status: "calling",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        candidates: {}
      });
      
      // Create an offer
      const offer = await peerConnectionRef.current!.createOffer();
      await peerConnectionRef.current!.setLocalDescription(offer);
      
      // Add offer to call document
      await updateDoc(doc(db, "calls", callId), {
        offer: {
          type: offer.type,
          sdp: offer.sdp
        },
        updatedAt: serverTimestamp()
      });
      
      setCallStatus('calling');
      
      // Listen for updates on the call document
      const unsubscribe = onSnapshot(doc(db, "calls", callId), async (docSnapshot) => {
        if (!docSnapshot.exists()) {
          // Call was deleted
          setCallStatus('idle');
          cleanupWebRTC();
          unsubscribe();
          return;
        }
        
        const data = docSnapshot.data();
        
        // Handle call rejection
        if (data.status === "rejected") {
          setCallStatus('idle');
          setCallError("Call was rejected");
          cleanupWebRTC();
          unsubscribe();
          return;
        }
        
        // Handle call acceptance and answer
        if (data.status === "accepted" && data.answer) {
          if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== "stable") {
            const answer = new RTCSessionDescription({
              type: data.answer.type,
              sdp: data.answer.sdp
            });
            
            await peerConnectionRef.current.setRemoteDescription(answer);
            setCallStatus('ongoing');
          }
        }
        
        // Handle remote ICE candidates
        if (data.candidates && data.candidates[user.uid]) {
          const candidate = data.candidates[user.uid];
          if (peerConnectionRef.current) {
            try {
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate({
                  sdpMLineIndex: candidate.sdpMLineIndex,
                  sdpMid: candidate.sdpMid,
                  candidate: candidate.candidate
                })
              );
            } catch (err) {
              console.error("Error adding received ice candidate", err);
            }
          }
        }
      });
      
      // Set timeout for unanswered calls
      setTimeout(() => {
        if (callStatus === 'calling') {
          endCall();
          setCallError("No answer");
        }
      }, 30000);
      
    } catch (err: any) {
      setCallError(err.message);
      cleanupWebRTC();
    }
  };

  // Answer an incoming call
  const answerCall = async () => {
    if (!callId || !currentUser || !remoteUser) return;
    
    try {
      // Initialize WebRTC
      const initialized = await initializeWebRTC();
      if (!initialized) return;
      
      // Get the call document
      const callDoc = await getDoc(doc(db, "calls", callId));
      if (!callDoc.exists()) {
        setCallError("Call no longer exists");
        return;
      }
      
      const callData = callDoc.data();
      
      // Set remote description (offer)
      if (callData.offer && peerConnectionRef.current) {
        const offer = new RTCSessionDescription({
          type: callData.offer.type,
          sdp: callData.offer.sdp
        });
        
        await peerConnectionRef.current.setRemoteDescription(offer);
        
        // Create answer
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        // Update call document with answer and status
        await updateDoc(doc(db, "calls", callId), {
          answer: {
            type: answer.type,
            sdp: answer.sdp
          },
          status: "accepted",
          updatedAt: serverTimestamp()
        });
        
        setCallStatus('ongoing');
      }
    } catch (err: any) {
      setCallError(err.message);
      cleanupWebRTC();
    }
  };

  // Reject an incoming call
  const rejectCall = async () => {
    if (!callId) return;
    
    try {
      await updateDoc(doc(db, "calls", callId), {
        status: "rejected",
        updatedAt: serverTimestamp()
      });
      
      setCallStatus('idle');
      setRemoteUser(null);
      setCallId(null);
    } catch (err: any) {
      setCallError(err.message);
    }
  };

  // End an ongoing call
  const endCall = async () => {
    if (!callId) return;
    
    try {
      // Delete the call document
      await deleteDoc(doc(db, "calls", callId));
      
      cleanupWebRTC();
      setCallStatus('idle');
      setRemoteUser(null);
      setCallId(null);
    } catch (err: any) {
      setCallError(err.message);
    }
  };

  // Listen for incoming calls
  useEffect(() => {
    if (!currentUser) return;
    
    const q = doc(db, "users", currentUser.uid);
    
    const unsubscribe = onSnapshot(q, async (docSnapshot) => {
      if (!docSnapshot.exists()) return;
      
      const userData = docSnapshot.data();
      
      if (userData.incomingCall && callStatus === 'idle') {
        // There's an incoming call
        const callId = userData.incomingCall;
        setCallId(callId);
        
        // Get call details
        const callDoc = await getDoc(doc(db, "calls", callId));
        if (callDoc.exists()) {
          const callData = callDoc.data();
          
          // Get caller info
          const callerDoc = await getDoc(doc(db, "users", callData.callerId));
          if (callerDoc.exists()) {
            setRemoteUser(callerDoc.data() as ChatUser);
            setCallStatus('receiving');
          }
        }
      }
    });
    
    return () => unsubscribe();
  }, [currentUser, callStatus]);

  return {
    callStatus,
    callError,
    remoteUser,
    localStreamRef,
    remoteStreamRef,
    startCall,
    answerCall,
    rejectCall,
    endCall
  };
} 