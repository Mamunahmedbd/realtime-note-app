import { Router } from 'express';
import { authenticate, validateRequest } from '../../middlewares';
import { NotesController } from './controller';
import {
    noteCreationRequestSchema,
    noteDestroyRequestSchema,
    noteIndexRequestSchema,
    noteShowRequestSchema,
    noteUpdateRequestSchema,
} from './request-schemas';

const app = Router();

app.get('/', NotesController.index);
app.post('/', [validateRequest(noteCreationRequestSchema), authenticate], NotesController.store);
app.get('/:id', validateRequest(noteShowRequestSchema), NotesController.show);
app.put('/:id', [validateRequest(noteUpdateRequestSchema), authenticate], NotesController.update);
app.delete(
    '/:id',
    [validateRequest(noteDestroyRequestSchema), authenticate],
    NotesController.destroy,
);

export { app as NotesRouter };
