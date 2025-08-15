import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  task_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read?: boolean;
  created_at: string;
}

interface ChatWindowProps {
  taskId: string;
  receiverId: string;
  receiverName: string;
  taskTitle: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  taskId,
  receiverId,
  receiverName,
  taskTitle,
  onClose,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      console.log('Chat Window Props:', {
        taskId,
        receiverId,
        receiverName,
        currentUserId: user.id
      });
      loadMessages();
      // Set up real-time subscription
      const subscription = supabase
        .channel(`chat_${taskId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `task_id=eq.${taskId}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, taskId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!user) return;

    try {
      console.log('Loading messages for:', { taskId, userId: user.id });
      
      const { data, error } = await supabase
        .from('chat_messages')
  .select('*')
  .eq('task_id', taskId)
  .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
  .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        
        // If table doesn't exist, show a message and set empty array
        if (error.message.includes('relation "public.chat_messages" does not exist')) {
          console.log('Chat messages table not set up yet, using fallback');
          setMessages([]);
          return;
        }
        
        toast({
          title: "Error",
          description: error.message || "Failed to load messages",
          variant: "destructive",
        });
        return;
      }

      console.log('Loaded messages:', data);
  setMessages(data || []);
      
      // Mark messages as read
      if (data && data.length > 0) {
        await markMessagesAsRead();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('task_id', taskId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim() || sending) return;

    // Check if user is trying to message themselves
    if (user.id === receiverId) {
      toast({
        title: "Invalid Action",
        description: "You cannot send a message to yourself",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    console.log('=== SENDING MESSAGE ===');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('Task ID:', taskId);
    console.log('Receiver ID:', receiverId);
    console.log('Message:', newMessage.trim());
    
    try {
      // First, let's test if we can access the table at all
      console.log('Testing table access...');
      const { data: testData, error: testError } = await supabase
        .from('chat_messages')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('Cannot access chat_messages table:', testError);
        // Fall back to notifications immediately
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: receiverId,
            type: 'message',
            title: 'New Message',
            message: `${user.email}: ${newMessage.trim()}`,
            metadata: {
              task_id: taskId,
              sender_id: user.id,
              message_type: 'chat_fallback'
            }
          });

        if (notifError) {
          console.error('Notification fallback also failed:', notifError);
          throw notifError;
        }

        toast({
          title: "Message Sent",
          description: "Message sent via notification (chat system being set up)",
        });
        
        setNewMessage('');
        return;
      }
      
      console.log('Table access OK, attempting insert...');
      
      const messageData = {
        task_id: taskId,
        sender_id: user.id,
        receiver_id: receiverId,
        message: newMessage.trim(),
      };
      
      console.log('Inserting message data:', messageData);

      // Now try to insert the message
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select();

      if (error) {
        console.error('=== SUPABASE INSERT ERROR ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        
        // Fall back to notifications
        console.log('Falling back to notification system...');
        
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: receiverId,
            type: 'message',
            title: 'New Message',
            message: `${user.email}: ${newMessage.trim()}`,
            metadata: {
              task_id: taskId,
              sender_id: user.id,
              message_type: 'chat_fallback'
            }
          });

        if (notifError) {
          console.error('Notification fallback also failed:', notifError);
          throw notifError;
        }

        toast({
          title: "Message Sent",
          description: "Message sent via notification (chat being fixed)",
        });
        
        setNewMessage('');
        return;
      }

      console.log('=== MESSAGE SENT SUCCESSFULLY ===');
      console.log('Response data:', data);
      if (data && data[0]) {
        setMessages((prev) => [...prev, data[0]]);
      }
      setNewMessage('');
      toast({
        title: "Message Sent",
        description: "Your message has been delivered",
      });
    } catch (error) {
      console.error('=== FINAL ERROR ===');
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
  <Card className="w-full max-w-md mx-auto bg-white shadow-xl border border-gray-200">
        <CardContent className="p-6">
          <div className="text-center">Loading chat...</div>
        </CardContent>
      </Card>
    );
  }

  return (
  <Card className="w-full max-w-md mx-auto h-96 bg-white shadow-xl border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">{receiverName}</CardTitle>
          <p className="text-sm text-muted-foreground truncate">{taskTitle}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex flex-col h-80 p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet</p>
                <p className="text-sm">Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.sender_id === user?.id;
                console.log('Message display:', {
                  messageId: message.id,
                  senderId: message.sender_id,
                  currentUserId: user?.id,
                  isCurrentUser,
                  content: message.content
                });
                
                return (
                <div
                  key={message.id}
                  className={`flex ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className="flex items-start space-x-2 max-w-xs">
                    {!isCurrentUser && (
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {receiverName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || sending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
