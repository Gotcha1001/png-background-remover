// 'use client';

// import { processImage } from '../api/actions/route';
// import { useState, useTransition } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { removeBackground } from '@imgly/background-removal';

// export default function Converter() {
//     const [previewImage, setPreviewImage] = useState(null);
//     const [foregroundImage, setForegroundImage] = useState(null);
//     const [error, setError] = useState(null);
//     const [downloadReady, setDownloadReady] = useState(false);
//     const [backgroundOption, setBackgroundOption] = useState('transparent');
//     const [isPending, startTransition] = useTransition();

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         setError(null);
//         const formData = new FormData(event.target);

//         let imgUrl = null;
//         let bgImgUrl = null;

//         startTransition(async () => {
//             try {
//                 const file = formData.get('file');
//                 if (!file || file.size === 0) {
//                     setError('No file uploaded');
//                     return;
//                 }

//                 const removeBg = formData.get('remove_bg') === 'on';
//                 const backgroundOption = formData.get('background_option') || 'transparent';
//                 const backgroundColor = formData.get('background_color') || '#ffffff';
//                 const bgFile = formData.get('background_file');

//                 // Read foreground image
//                 imgUrl = URL.createObjectURL(file);
//                 let foregroundBase64 = null;

//                 if (removeBg) {
//                     // Remove background using @imgly/background-removal
//                     const blob = await removeBackground(file);
//                     foregroundBase64 = await new Promise((resolve) => {
//                         const reader = new FileReader();
//                         reader.onloadend = () => resolve(reader.result);
//                         reader.readAsDataURL(blob);
//                     });
//                 } else {
//                     // Convert to PNG without background removal
//                     const img = new window.Image();
//                     img.src = imgUrl;
//                     await new Promise((resolve) => (img.onload = resolve));
//                     const canvas = document.createElement('canvas');
//                     canvas.width = img.width;
//                     canvas.height = img.height;
//                     const ctx = canvas.getContext('2d');
//                     ctx.drawImage(img, 0, 0);
//                     foregroundBase64 = canvas.toDataURL('image/png');
//                 }

//                 let outputBase64 = foregroundBase64;

//                 if (removeBg && backgroundOption === 'image' && bgFile && bgFile.size > 0) {
//                     const bgImg = new window.Image();
//                     bgImgUrl = URL.createObjectURL(bgFile);
//                     bgImg.src = bgImgUrl;
//                     await new Promise((resolve) => (bgImg.onload = resolve));

//                     const canvas = document.createElement('canvas');
//                     canvas.width = bgImg.width;
//                     canvas.height = bgImg.height;
//                     const ctx = canvas.getContext('2d');
//                     ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
//                     const fgImg = new window.Image();
//                     fgImg.src = foregroundBase64;
//                     await new Promise((resolve) => (fgImg.onload = resolve));
//                     ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);
//                     outputBase64 = canvas.toDataURL('image/png');
//                 } else if (removeBg && backgroundOption === 'color') {
//                     const img = new window.Image();
//                     img.src = foregroundBase64;
//                     await new Promise((resolve) => (img.onload = resolve));
//                     const canvas = document.createElement('canvas');
//                     canvas.width = img.width;
//                     canvas.height = img.height;
//                     const ctx = canvas.getContext('2d');
//                     ctx.fillStyle = backgroundColor;
//                     ctx.fillRect(0, 0, canvas.width, canvas.height);
//                     ctx.drawImage(img, 0, 0);
//                     outputBase64 = canvas.toDataURL('image/png');
//                 }

//                 // Validate with server action
//                 const result = await processImage(formData);
//                 if (result.error) {
//                     setError(result.error);
//                 } else {
//                     setPreviewImage(outputBase64);
//                     setForegroundImage(foregroundBase64);
//                     setDownloadReady(true);
//                 }
//             } catch (err) {
//                 setError(`Error processing image: ${err.message}`);
//             } finally {
//                 // Clean up object URLs
//                 if (imgUrl) URL.revokeObjectURL(imgUrl);
//                 if (bgImgUrl) URL.revokeObjectURL(bgImgUrl);
//             }
//         });
//     };

//     const handleBackgroundOptionChange = (e) => {
//         setBackgroundOption(e.target.value);
//     };

//     return (
//         <div className="container">
//             <h1 className="text-4xl font-bold mb-6 text-shadow-md">Convert or Remove Background</h1>
//             <div className="bg-[#1a0f2e] rounded-xl p-8 mb-8 shadow-2xl">
//                 <form onSubmit={handleSubmit} encType="multipart/form-data">
//                     <div className="relative inline-block mb-4">
//                         <input
//                             type="file"
//                             name="file"
//                             accept="image/*"
//                             required
//                             id="file-input"
//                             className="opacity-0 absolute w-full h-full cursor-pointer"
//                         />
//                         <label htmlFor="file-input" className="btn bg-gradient-to-r from-gray-500 to-gray-400">
//                             Choose Foreground Image
//                         </label>
//                     </div>
//                     <div className="text-left text-gray-200 mb-4">
//                         <input
//                             type="checkbox"
//                             id="remove-bg"
//                             name="remove_bg"
//                             className="mr-2 accent-green-400"
//                         />
//                         <label htmlFor="remove-bg">Remove Background</label>
//                     </div>
//                     <div className="text-left text-gray-200 mb-4">
//                         <p>Background Option:</p>
//                         <input
//                             type="radio"
//                             id="transparent"
//                             name="background_option"
//                             value="transparent"
//                             checked={backgroundOption === 'transparent'}
//                             onChange={handleBackgroundOptionChange}
//                             className="mr-2 accent-green-400"
//                         />
//                         <label htmlFor="transparent">Transparent</label><br />
//                         <input
//                             type="radio"
//                             id="image"
//                             name="background_option"
//                             value="image"
//                             checked={backgroundOption === 'image'}
//                             onChange={handleBackgroundOptionChange}
//                             className="mr-2 accent-green-400"
//                         />
//                         <label htmlFor="image">Custom Image</label><br />
//                         <div className={`relative inline-block mb-4 ${backgroundOption === 'image' ? 'block' : 'hidden'}`}>
//                             <input
//                                 type="file"
//                                 name="background_file"
//                                 accept="image/*"
//                                 id="bg-file-input"
//                                 className="opacity-0 absolute w-full h-full cursor-pointer"
//                             />
//                             <label htmlFor="bg-file-input" className="btn bg-gradient-to-r from-gray-500 to-gray-400">
//                                 Choose Background Image
//                             </label>
//                         </div>
//                         <input
//                             type="radio"
//                             id="color"
//                             name="background_option"
//                             value="color"
//                             checked={backgroundOption === 'color'}
//                             onChange={handleBackgroundOptionChange}
//                             className="mr-2 accent-green-400"
//                         />
//                         <label htmlFor="color">Solid Color</label><br />
//                         <div className={`mb-4 ${backgroundOption === 'color' ? 'block' : 'hidden'}`}>
//                             <input
//                                 type="color"
//                                 name="background_color"
//                                 defaultValue="#ffffff"
//                                 className="w-12 h-8 border-none cursor-pointer"
//                             />
//                         </div>
//                     </div>
//                     <button type="submit" className="btn" disabled={isPending}>
//                         {isPending ? 'Processing...' : 'Process Image'}
//                     </button>
//                 </form>
//                 {error && <p className="text-red-400 mt-4 font-medium">{error}</p>}
//             </div>
//             {previewImage && (
//                 <div className="preview-container">
//                     <Image src={previewImage} alt="Processed Image" width={600} height={400} className="preview-img" />
//                 </div>
//             )}
//             {downloadReady && (
//                 <a href={previewImage} download="converted_image.png" className="btn mt-6">
//                     Download PNG
//                 </a>
//             )}
//             <Link href="/" className="btn mt-6">Back to Home</Link>
//         </div>
//     );
// }


// app/converter/page.jsx
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { processImage } from '../api/actions/route';
import { removeBackground } from '@imgly/background-removal';
import { motion } from 'framer-motion';

export default function Converter() {
    const [previewImage, setPreviewImage] = useState(null);
    const [foregroundImage, setForegroundImage] = useState(null);
    const [error, setError] = useState(null);
    const [downloadReady, setDownloadReady] = useState(false);
    const [backgroundOption, setBackgroundOption] = useState('transparent');
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        const formData = new FormData(event.target);

        let imgUrl = null;
        let bgImgUrl = null;

        startTransition(async () => {
            try {
                const file = formData.get('file');
                if (!file || file.size === 0) {
                    setError('No file uploaded');
                    return;
                }

                const removeBg = formData.get('remove_bg') === 'on';
                const backgroundOption = formData.get('background_option') || 'transparent';
                const backgroundColor = formData.get('background_color') || '#ffffff';
                const bgFile = formData.get('background_file');

                imgUrl = URL.createObjectURL(file);
                let foregroundBase64 = null;

                if (removeBg) {
                    // Remove background using @imgly/background-removal
                    const blob = await removeBackground(file);
                    foregroundBase64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                } else {
                    // Convert to PNG without background removal
                    const img = new window.Image();
                    img.src = imgUrl;
                    await new Promise((resolve) => (img.onload = resolve));
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    foregroundBase64 = canvas.toDataURL('image/png');
                }

                let outputBase64 = foregroundBase64;

                if (removeBg && backgroundOption === 'image' && bgFile && bgFile.size > 0) {
                    const bgImg = new window.Image();
                    bgImgUrl = URL.createObjectURL(bgFile);
                    bgImg.src = bgImgUrl;
                    await new Promise((resolve) => (bgImg.onload = resolve));

                    const fgImg = new window.Image();
                    fgImg.src = foregroundBase64;
                    await new Promise((resolve) => (fgImg.onload = resolve));

                    const canvas = document.createElement('canvas');
                    canvas.width = bgImg.width;
                    canvas.height = bgImg.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

                    // Center the foreground image
                    const fgWidth = fgImg.width;
                    const fgHeight = fgImg.height;
                    const xOffset = (canvas.width - fgWidth) / 2;
                    const yOffset = (canvas.height - fgHeight) / 2;
                    ctx.drawImage(fgImg, xOffset, yOffset, fgWidth, fgHeight);

                    outputBase64 = canvas.toDataURL('image/png');
                } else if (removeBg && backgroundOption === 'color') {
                    const img = new window.Image();
                    img.src = foregroundBase64;
                    await new Promise((resolve) => (img.onload = resolve));
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    outputBase64 = canvas.toDataURL('image/png');
                }

                // Validate with server action
                const result = await processImage(formData);
                if (result.error) {
                    setError(result.error);
                } else {
                    setPreviewImage(outputBase64);
                    setForegroundImage(foregroundBase64);
                    setDownloadReady(true);
                }
            } catch (err) {
                setError(`Error processing image: ${err.message}`);
            } finally {
                if (imgUrl) URL.revokeObjectURL(imgUrl);
                if (bgImgUrl) URL.revokeObjectURL(bgImgUrl);
            }
        });
    };

    const handleBackgroundOptionChange = (e) => {
        setBackgroundOption(e.target.value);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container px-4 sm:px-6 lg:px-8"
        >
            <h1 className="text-4xl font-bold mb-6 text-shadow-md">Convert or Remove Background</h1>
            <div className="bg-[#1a0f2e] rounded-xl p-6 sm:p-8 mb-8 shadow-2xl">
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                    <div className="relative inline-block">
                        <input
                            type="file"
                            name="file"
                            accept="image/*"
                            required
                            id="file-input"
                            className="opacity-0 absolute w-full h-full cursor-pointer"
                        />
                        <label htmlFor="file-input" className="btn">Choose Foreground Image</label>
                    </div>
                    <div className="text-gray-200">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                id="remove-bg"
                                name="remove_bg"
                                className="mr-2 accent-green-400"
                            />
                            Remove Background
                        </label>
                    </div>
                    <div className="text-gray-200">
                        <p>Background Option:</p>
                        <label className="block">
                            <input
                                type="radio"
                                name="background_option"
                                value="transparent"
                                checked={backgroundOption === 'transparent'}
                                onChange={handleBackgroundOptionChange}
                                className="mr-2"
                            />
                            Transparent
                        </label>
                        <label className="block">
                            <input
                                type="radio"
                                name="background_option"
                                value="image"
                                checked={backgroundOption === 'image'}
                                onChange={handleBackgroundOptionChange}
                                className="mr-2"
                            />
                            Custom Image
                        </label>
                        {backgroundOption === 'image' && (
                            <div className="relative inline-block">
                                <input
                                    type="file"
                                    name="background_file"
                                    accept="image/*"
                                    id="bg-file-input"
                                    className="opacity-0 absolute w-full h-full cursor-pointer"
                                />
                                <label htmlFor="bg-file-input" className="btn">Choose Background Image</label>
                            </div>
                        )}
                        <label className="block">
                            <input
                                type="radio"
                                name="background_option"
                                value="color"
                                checked={backgroundOption === 'color'}
                                onChange={handleBackgroundOptionChange}
                                className="mr-2"
                            />
                            Solid Color
                        </label>
                        {backgroundOption === 'color' && (
                            <input
                                type="color"
                                name="background_color"
                                defaultValue="#ffffff"
                                className="w-12 h-8 border-none cursor-pointer"
                            />
                        )}
                    </div>
                    <button type="submit" className="btn w-full sm:w-auto" disabled={isPending}>
                        {isPending ? 'Processing...' : 'Process Image'}
                    </button>
                </form>
                {error && <p className="text-red-400 mt-4 font-medium">{error}</p>}
            </div>
            {previewImage && (
                <div className="preview-container">
                    <Image src={previewImage} alt="Processed Image" width={600} height={400} className="preview-img" />
                </div>
            )}
            {downloadReady && (
                <a
                    href={previewImage}
                    download="converted_image.png"
                    className="btn mt-6 block w-full sm:w-auto mx-auto"
                >
                    Download PNG
                </a>
            )}
            <Link href="/" className="btn mt-6 block w-full sm:w-auto mx-auto">
                Back to Home
            </Link>
        </motion.div>
    );
}