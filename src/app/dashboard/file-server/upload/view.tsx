"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';

interface UploadResponse {
    success: boolean;
    fileName: string;
}

type FileAccess = 'public' | 'private';

export default function FileUploadView() {
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [accessType, setAccessType] = useState<FileAccess>('public');

    const uploadFileMutation = useMutation<UploadResponse, Error, { file: File; access: FileAccess }>({
        mutationFn: async ({ file, access }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('access', access);

            const response = await fetch('/api/file', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'file upload failed');
            }

            return response.json();
        },
        onSuccess: (data) => {
            setUploadedFileName(data.fileName);
            console.log('Upload successful:', data);
        },
        onError: (error) => {
            setUploadedFileName(null);
            console.error('upload error:', error);
        },
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setUploadedFileName(null);
            uploadFileMutation.mutate({ 
                file: acceptedFiles[0], 
                access: accessType 
            });
        }
    }, [uploadFileMutation, accessType]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleAccessTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setAccessType(event.target.value as FileAccess);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Upload Files</h1>

            {/* Access Type Selection */}
            <div className="mb-6">
                <label htmlFor="access" className="block text-sm font-medium text-gray-700 mb-2">
                    File Access Type
                </label>
                <select
                    id="access"
                    value={accessType}
                    onChange={handleAccessTypeChange}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                    {accessType === 'public' 
                        ? 'Anyone can access this file' 
                        : 'Only owner and admins can access this file'
                    }
                </p>
            </div>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
                    flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg
                    cursor-pointer transition-colors duration-200
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
                    min-h-[200px]
                `}
                style={{ minWidth: '400px' }}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p className="text-lg text-blue-700">Drop the files here ...</p>
                ) : (
                    <p className="text-lg text-gray-600">Drag & drop your file here, or click to select a file</p>
                )}
            </div>

            {/* Upload Status */}
            {uploadFileMutation.isPending && (
                <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-md">
                    Uploading file... ({accessType} access)
                </div>
            )}

            {uploadFileMutation.isError && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
                    Error uploading file: {uploadFileMutation.error?.message || 'Unknown error'}
                </div>
            )}

            {uploadFileMutation.isSuccess && uploadedFileName && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
                    Successfully uploaded: <span className="font-semibold">{uploadedFileName}</span>
                    <br />
                    <span className="text-sm">Access type: {accessType}</span>
                </div>
            )}
        </div>
    );
}