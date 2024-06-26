import { BatchItem, FILE_STATES } from "@rpldy/shared";
import { OnProgress, SendMethod, SendOptions, SendResult } from '@rpldy/sender';
import { BlockBlobClient } from "@azure/storage-blob"
import { useEffect, useState } from "react";
import { getAlbumCollections } from "./photoService.js";

export function azureBlobStorageSender(
    blobClient: BlockBlobClient,
    storagePath: string,
    container: string,
) {
    const process: SendMethod = (
        items: BatchItem[],
        url: string | undefined = '',
        options: SendOptions,
        onProgress?: OnProgress
    ) => {
        let result: SendResult
        blobClient.upload(<Blob>(<unknown>items[0].file), items[0].file.size);

        return {
            request: new Promise((resolve, reject) =>
                resolve({ status: 1, state: FILE_STATES.FINISHED, response: null }),
            ),
            abort: () => false,
            senderType: '?',
        };
    };

    return process;
}

export default azureBlobStorageSender;