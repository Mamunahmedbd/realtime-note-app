import { NextFunction, Request, Response } from 'express';
import { NotFoundException } from '../../utils';
import Note from 'src/models/Note';

export class NotesController {
    static async index(req: Request, res: Response, next: NextFunction) {
        const notes = await Note.find();

        res.json(notes);
    }

    static async show(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;

        const note = await Note.findById(id);

        if (!note) {
            throw new NotFoundException('Note not found');
        }

        res.json(note);
    }

    static async store(req: Request, res: Response, next: NextFunction) {
        const payload = req.body;
        const userId = req.user!.id;

        const note = new Note({ ...payload, owner: userId });

        await note.save();

        res.json(note);
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        console.log({ req });
        const noteId = req.params.id;
        const payload = req.body;

        const note = await Note.findById({ _id: noteId });

        console.log({ note, payload });

        if (!note) {
            throw new NotFoundException('Note not found');
        }

        note.name = payload.name;
        note.content = payload.content;

        await note.save();

        res.json(note);
    }

    static async destroy(req: Request, res: Response, next: NextFunction) {
        const noteId = req.params.id;

        const note = await Note.findByIdAndDelete(noteId);

        if (!note) {
            throw new NotFoundException('Note not found');
        }

        res.json({ message: 'Note deleted successfully' });
    }
}
