import multer from "multer";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url) // nos da la ruta desde donde se esta haciendo el import
export const __dirname = dirname(__filename)

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, __dirname + '/public/img')
    },
    filename: (req, file, callback) => {
        callback(null,file.originalname)
    }
})
export const uploader = multer({ storage })

// Funcion para verificar si un dato esta compuesto solo por numero y no caracteres 
export function isNumeric(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
}