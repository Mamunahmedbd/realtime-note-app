import { Server, Socket } from 'socket.io';
import Note from 'src/models/Note';

const activeUsers = new Map(); // Store users with their socket IDs

const registerSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('A user connected');
        // Handle user joining
        socket.on('join', (user) => {
            if (!activeUsers.has(user.id)) {
                activeUsers.set(user.id, { ...user, socketId: socket.id });

                // Notify all users about the new active user
                io.emit('userJoined', user);

                // Send updated list to all clients
                io.emit('activeUsers', Array.from(activeUsers.values()));
            }
        });

        socket.on('fetchNotes', async ({ page = 1, limit = 10 }) => {
            try {
                const notes = await Note.find()
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .sort({ createdAt: -1 });

                const totalNotes = await Note.countDocuments(); // Total note count

                socket.emit('getNotes', {
                    notes,
                    currentPage: page,
                    totalPages: Math.ceil(totalNotes / limit),
                });
            } catch (error) {
                console.error('Error fetching notes:', error);
                socket.emit('error', { message: 'Failed to fetch notes' });
            }
        });

        // Select a note
        socket.on('selectNote', async ({ noteId }) => {
            try {
                const note = await Note.findById(noteId);
                if (note) {
                    socket.emit('noteSelected', note);
                } else {
                    // latest note push to client
                    const latestNote = await Note.findOne().sort({ createdAt: -1 });
                    if (latestNote) {
                        socket.emit('noteSelected', latestNote);
                    } else {
                        socket.emit('error', { message: 'No notes found' });
                    }
                }
            } catch (error) {
                console.error('Error selecting note:', error);
                socket.emit('error', { message: 'Error selecting note' });
            }
        });

        socket.on('updateNoteTitle', async ({ noteId, title }) => {
            try {
                const updatedNote = await Note.findByIdAndUpdate(
                    noteId,
                    { name: title },
                    { new: true },
                );

                if (updatedNote) {
                    socket.broadcast.emit('noteTitleUpdated', { noteId, title }); // Exclude sender
                }
            } catch (error) {
                console.error('Error updating note title:', error);
                socket.emit('error', { message: 'Failed to update note title' });
            }
        });

        socket.on('updateNoteContent', async ({ noteId, content }) => {
            try {
                // Validate input
                if (!noteId || typeof content !== 'string') {
                    return socket.emit('error', { message: 'Invalid input data' });
                }

                // Use `lean()` for better performance (if not needed for further processing)
                const updatedNote = await Note.findByIdAndUpdate(
                    noteId,
                    { content },
                    { new: true, lean: true },
                ).select('_id content'); // Select only necessary fields

                if (!updatedNote) {
                    return socket.emit('error', { message: 'Note not found' });
                }

                // Emit update only if content actually changed
                socket.broadcast.emit('noteContentUpdated', { noteId, content });
            } catch (error) {
                console.error('Error updating note content:', error);
                socket.emit('error', { message: 'Failed to update note content' });
            }
        });

        socket.on('createNote', async ({ title, content, userId }) => {
            try {
                if (!userId) return socket.emit('error', { message: 'User not authenticated' });
                const newNote = new Note({ name: title, content, owner: userId });
                await newNote.save();
                socket.broadcast.emit('noteCreated', newNote);
                socket.emit('noteCreated', newNote);
            } catch (error) {
                console.error('Error creating note:', error);
                socket.emit('error', { message: 'Failed to create note' });
            }
        });

        // Listen for delete note requests from clients
        socket.on('deleteNote', async ({ noteId }) => {
            try {
                // Find and delete the note by ID
                const deletedNote = await Note.findByIdAndDelete(noteId);

                if (deletedNote) {
                    // Emit noteDeleted to all connected clients except the sender
                    socket.broadcast.emit('noteDeleted', noteId);

                    // Optionally, you could also emit a success message to the sender
                    socket.emit('noteDeleted', noteId);
                } else {
                    // Emit error if the note was not found
                    socket.emit('error', { message: 'Note not found' });
                }
            } catch (error) {
                console.error('Error deleting note:', error);
                socket.emit('error', { message: 'Failed to delete note' });
            }
        });

        // Handle user leaving (disconnect)
        socket.on('disconnect', () => {
            let disconnectedUserId = null;

            for (let [id, user] of activeUsers) {
                if (user.socketId === socket.id) {
                    disconnectedUserId = id;
                    activeUsers.delete(id);
                    break;
                }
            }

            if (disconnectedUserId) {
                io.emit('userLeft', disconnectedUserId);
                io.emit('activeUsers', Array.from(activeUsers.values()));
            }

            console.log('User disconnected:', socket.id);
        });

        // Handle manual user logout (if applicable)
        socket.on('logout', (userId) => {
            if (activeUsers.has(userId)) {
                activeUsers.delete(userId);
                io.emit('userLeft', userId);
                io.emit('activeUsers', Array.from(activeUsers.values()));
            }
        });
    });
};

export default registerSocketHandlers;
