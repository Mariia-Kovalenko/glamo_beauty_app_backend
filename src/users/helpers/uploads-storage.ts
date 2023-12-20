import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuid } from 'uuid';

type ValidFileExtension = 'png' | 'jpg' | 'jpeg';
type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

const validFileExtentions: ValidFileExtension[] = ['png', 'jpg', 'jpeg'];
const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];


export const createStorage = (destination: string) => ({
  storage: diskStorage({
    destination,
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuid();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes: validMimeType[] = validMimeTypes;
    allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
  },
});


// export const storage = {
//   storage: diskStorage({
//     destination: './uploads/profileImages',
//     filename: (req, file, cb) => {
//       const filename: string =
//         path.parse(file.originalname).name.replace(/\s/g, '') + uuid();
//       const extension: string = path.parse(file.originalname).ext;

//       cb(null, `${filename}${extension}`);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     const allowedMimeTypes: validMimeType[] = validMimeTypes;
//     allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
//   },
// };

// export const galleryStorage = {
//   storage: diskStorage({
//     destination: './uploads/gallery',
//     filename: (req, file, cb) => {
//       const filename: string =
//         path.parse(file.originalname).name.replace(/\s/g, '') + uuid();
//       const extension: string = path.parse(file.originalname).ext;

//       cb(null, `${filename}${extension}`);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     const allowedMimeTypes: validMimeType[] = validMimeTypes;
//     allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
//   },
// }
