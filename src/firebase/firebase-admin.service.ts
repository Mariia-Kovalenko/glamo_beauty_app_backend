import * as admin from "firebase-admin";
import { Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import * as path from "path";

@Injectable()
export class FirebaseAdminService {
    constructor() {
        if (!admin.apps.length) {
            const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            if (!serviceAccountPath) {
                throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not defined in .env");
            }

            admin.initializeApp({
                credential: admin.credential.cert(
                    require(path.resolve(serviceAccountPath)), // Load service account key
                ),
                storageBucket: "brigantina-7d18a.appspot.com", // Replace with your Firebase Storage bucket name
            });
        }
    }

    private getStorageBucket() {
        return admin.storage().bucket();
    }

    /**
     * Uploads a file to Firebase Storage and returns its public URL.
     * @param file The file to upload (from Multer).
     * @returns Public URL of the uploaded file.
     */
    async uploadFile(file: Express.Multer.File): Promise<string> {
        const bucket = this.getStorageBucket();
        const fileName = `glamoProfileImages/${uuid()}-${file.originalname}`;
        const fileRef = bucket.file(fileName);

        try {
            // Upload the file to Firebase Storage
            await fileRef.save(file.buffer, {
                contentType: file.mimetype,
            });

            // Make the file publicly accessible (optional)
            await fileRef.makePublic();

            // Get public URL
            const publicUrl = fileRef.publicUrl();
            return publicUrl;
        } catch (error) {
            console.error("Error uploading file:", error.message);
            throw new Error("Failed to upload file to Firebase Storage");
        }
    }

    /**
     * Deletes a file from Firebase Storage.
     * @param filePath The file path to delete (e.g., "glamoProfileImages/filename").
     */
    async deleteFile(filePath: string): Promise<void> {
        const bucket = this.getStorageBucket();
        const fileRef = bucket.file(filePath);

        try {
            await fileRef.delete();
            console.log(`File ${filePath} deleted successfully`);
        } catch (error) {
            console.error("Error deleting file:", error.message);
            throw new Error(`Failed to delete file: ${filePath}`);
        }
    }
}
