-- Add is_read column to chat_messages table
-- This will track whether a message has been read by the receiver

-- First, check if chat_messages table exists, if not create it
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_read column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'is_read'
    ) THEN
        ALTER TABLE public.chat_messages 
        ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add index for better performance on unread message queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread 
ON public.chat_messages(receiver_id, is_read, task_id) 
WHERE is_read = FALSE;

-- Add index for task-based message queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_task 
ON public.chat_messages(task_id, created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see messages where they are sender or receiver
CREATE POLICY "Users can view their own messages" ON public.chat_messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

-- Users can insert messages where they are the sender
CREATE POLICY "Users can send messages" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

-- Users can update read status of messages sent to them
CREATE POLICY "Users can mark their received messages as read" ON public.chat_messages
    FOR UPDATE USING (
        auth.uid() = receiver_id
    ) WITH CHECK (
        auth.uid() = receiver_id
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.chat_messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
