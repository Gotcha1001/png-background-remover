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
// 'use client';

// import { useState, useTransition, useEffect } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { processImage } from '../api/actions/route';
// import { motion } from 'framer-motion';
// import { toast } from 'sonner';

// export default function Converter() {
//     const [previewImage, setPreviewImage] = useState(null);
//     const [foregroundImage, setForegroundImage] = useState(null);
//     const [error, setError] = useState(null);
//     const [downloadReady, setDownloadReady] = useState(false);
//     const [backgroundOption, setBackgroundOption] = useState('transparent');
//     const [isPending, startTransition] = useTransition();
//     const [removeBackground, setRemoveBackground] = useState(null);

//     // Dynamically import @imgly/background-removal on the client side
//     useEffect(() => {
//         import('@imgly/background-removal').then((module) => {
//             setRemoveBackground(() => module.removeBackground);
//         });
//     }, []);

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

//                 toast.success("Processing Image...");

//                 imgUrl = URL.createObjectURL(file);
//                 let foregroundBase64 = null;

//                 if (removeBg && removeBackground) {
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

//                     const fgImg = new window.Image();
//                     fgImg.src = foregroundBase64;
//                     await new Promise((resolve) => (fgImg.onload = resolve));

//                     const canvas = document.createElement('canvas');
//                     canvas.width = bgImg.width;
//                     canvas.height = bgImg.height;
//                     const ctx = canvas.getContext('2d');
//                     ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

//                     const fgWidth = fgImg.width;
//                     const fgHeight = fgImg.height;
//                     const xOffset = (canvas.width - fgWidth) / 2;
//                     const yOffset = (canvas.height - fgHeight) / 2;
//                     ctx.drawImage(fgImg, xOffset, yOffset, fgWidth, fgHeight);

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
//                 if (imgUrl) URL.revokeObjectURL(imgUrl);
//                 if (bgImgUrl) URL.revokeObjectURL(bgImgUrl);
//             }
//         });
//     };

//     const handleBackgroundOptionChange = (e) => {
//         setBackgroundOption(e.target.value);
//     };

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="flex flex-col items-center min-h-screen py-8 px-4 sm:px-6 lg:px-8"
//         >
//             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">
//                 Convert or Remove Background
//             </h1>
//             <div className="w-full max-w-lg bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-6 sm:p-8 mb-8 shadow-2xl">
//                 <form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col space-y-6">
//                     <div className="flex flex-col items-center">
//                         <label
//                             htmlFor="file-input"
//                             className="inline-block bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
//                         >
//                             Choose Foreground Image
//                         </label>
//                         <input
//                             type="file"
//                             name="file"
//                             accept="image/*"
//                             required
//                             id="file-input"
//                             className="hidden"
//                         />
//                     </div>
//                     <div className="flex items-center justify-center text-gray-200">
//                         <label className="flex items-center cursor-pointer">
//                             <input
//                                 type="checkbox"
//                                 id="remove-bg"
//                                 name="remove_bg"
//                                 className="mr-2 h-5 w-5 text-green-400 border-gray-300 rounded focus:ring-green-500"
//                             />
//                             Remove Background
//                         </label>
//                     </div>
//                     <div className="flex flex-col items-center text-gray-200 space-y-4">
//                         <p className="font-semibold">Background Option:</p>
//                         <label className="flex items-center">
//                             <input
//                                 type="radio"
//                                 name="background_option"
//                                 value="transparent"
//                                 checked={backgroundOption === 'transparent'}
//                                 onChange={handleBackgroundOptionChange}
//                                 className="mr-2 h-4 w-4 text-green-400 border-gray-300 focus:ring-green-500"
//                             />
//                             Transparent
//                         </label>
//                         <label className="flex items-center">
//                             <input
//                                 type="radio"
//                                 name="background_option"
//                                 value="image"
//                                 checked={backgroundOption === 'image'}
//                                 onChange={handleBackgroundOptionChange}
//                                 className="mr-2 h-4 w-4 text-green-400 border-gray-300 focus:ring-green-500"
//                             />
//                             Custom Image
//                         </label>
//                         {backgroundOption === 'image' && (
//                             <div className="flex flex-col items-center">
//                                 <label
//                                     htmlFor="bg-file-input"
//                                     className="inline-block bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
//                                 >
//                                     Choose Background Image
//                                 </label>
//                                 <input
//                                     type="file"
//                                     name="background_file"
//                                     accept="image/*"
//                                     id="bg-file-input"
//                                     className="hidden"
//                                 />
//                             </div>
//                         )}
//                         <label className="flex items-center">
//                             <input
//                                 type="radio"
//                                 name="background_option"
//                                 value="color"
//                                 checked={backgroundOption === 'color'}
//                                 onChange={handleBackgroundOptionChange}
//                                 className="mr-2 h-4 w-4 text-green-400 border-gray-300 focus:ring-green-500"
//                             />
//                             Solid Color
//                         </label>
//                         {backgroundOption === 'color' && (
//                             <input
//                                 type="color"
//                                 name="background_color"
//                                 defaultValue="#ffffff"
//                                 className="w-12 h-8 border-none rounded cursor-pointer"
//                             />
//                         )}
//                     </div>
//                     <button
//                         type="submit"
//                         className="w-full bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
//                         disabled={isPending}
//                     >
//                         {isPending ? 'Processing...' : 'Process Image'}
//                     </button>
//                 </form>
//                 {error && (
//                     <p className="text-red-400 mt-4 font-medium text-center">{error}</p>
//                 )}
//             </div>
//             {previewImage && (
//                 <motion.div
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.5 }}
//                     className="w-full max-w-2xl bg-gradient-to-r from-purple-900 via-indigo-500 to-black rounded-xl overflow-hidden shadow-xl mb-8"
//                 >
//                     <Image
//                         src={previewImage}
//                         alt="Processed Image"
//                         width={600}
//                         height={400}
//                         className="w-full h-auto max-h-96 object-contain transition-transform duration-300 hover:scale-105"
//                     />
//                 </motion.div>
//             )}
//             {downloadReady && (
//                 <a
//                     href={previewImage}
//                     download="converted_image.png"
//                     className="w-full max-w-xs bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center mb-4"
//                 >
//                     Download PNG
//                 </a>
//             )}
//             <Link
//                 href="/"
//                 className="w-full max-w-xs bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center"
//             >
//                 Back to Home
//             </Link>
//         </motion.div>
//     );
// }



'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { processImage } from '../api/actions/route';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Converter() {
    const [previewImage, setPreviewImage] = useState(null);
    const [foregroundImage, setForegroundImage] = useState(null);
    const [error, setError] = useState(null);
    const [downloadReady, setDownloadReady] = useState(false);
    const [backgroundOption, setBackgroundOption] = useState('transparent');
    const [isPending, startTransition] = useTransition();
    const [removeBackground, setRemoveBackground] = useState(null);

    // Dynamically import @imgly/background-removal on the client side
    useEffect(() => {
        import('@imgly/background-removal').then((module) => {
            // Configure the library with proper settings
            if (module.Config) {
                module.Config.publicPath = '/_next/static/media/';
            }
            setRemoveBackground(() => module.removeBackground);
        }).catch((err) => {
            console.error('Failed to load background removal library:', err);
            // Fallback: disable background removal if library fails to load
            setError('Background removal feature unavailable. You can still convert images to PNG format.');
        });
    }, []);

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

                toast.success("Processing Image...");

                imgUrl = URL.createObjectURL(file);
                let foregroundBase64 = null;

                if (removeBg && removeBackground) {
                    try {
                        // Remove background using @imgly/background-removal
                        const blob = await removeBackground(file, {
                            debug: false,
                            progress: (key, current, total) => {
                                console.log(`Downloading ${key}: ${current} of ${total}`);
                            }
                        });
                        foregroundBase64 = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                    } catch (bgRemovalError) {
                        console.error('Background removal failed:', bgRemovalError);
                        setError('Background removal failed. Converting to PNG without background removal.');
                        // Fallback to regular conversion
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
            className="flex flex-col items-center min-h-screen py-8 px-4 sm:px-6 lg:px-8"
        >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">
                Convert or Remove Background
            </h1>
            <div className="w-full max-w-lg bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-6 sm:p-8 mb-8 shadow-2xl">
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col space-y-6">
                    <div className="flex flex-col items-center">
                        <label
                            htmlFor="file-input"
                            className="inline-block bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                        >
                            Choose Foreground Image
                        </label>
                        <input
                            type="file"
                            name="file"
                            accept="image/*"
                            required
                            id="file-input"
                            className="hidden"
                        />
                    </div>
                    <div className="flex items-center justify-center text-gray-200">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="remove-bg"
                                name="remove_bg"
                                className="mr-2 h-5 w-5 text-green-400 border-gray-300 rounded focus:ring-green-500"
                                disabled={!removeBackground}
                            />
                            Remove Background {!removeBackground && '(Loading...)'}
                        </label>
                    </div>
                    <div className="flex flex-col items-center text-gray-200 space-y-4">
                        <p className="font-semibold">Background Option:</p>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="background_option"
                                value="transparent"
                                checked={backgroundOption === 'transparent'}
                                onChange={handleBackgroundOptionChange}
                                className="mr-2 h-4 w-4 text-green-400 border-gray-300 focus:ring-green-500"
                            />
                            Transparent
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="background_option"
                                value="image"
                                checked={backgroundOption === 'image'}
                                onChange={handleBackgroundOptionChange}
                                className="mr-2 h-4 w-4 text-green-400 border-gray-300 focus:ring-green-500"
                            />
                            Custom Image
                        </label>
                        {backgroundOption === 'image' && (
                            <div className="flex flex-col items-center">
                                <label
                                    htmlFor="bg-file-input"
                                    className="inline-block bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                                >
                                    Choose Background Image
                                </label>
                                <input
                                    type="file"
                                    name="background_file"
                                    accept="image/*"
                                    id="bg-file-input"
                                    className="hidden"
                                />
                            </div>
                        )}
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="background_option"
                                value="color"
                                checked={backgroundOption === 'color'}
                                onChange={handleBackgroundOptionChange}
                                className="mr-2 h-4 w-4 text-green-400 border-gray-300 focus:ring-green-500"
                            />
                            Solid Color
                        </label>
                        {backgroundOption === 'color' && (
                            <input
                                type="color"
                                name="background_color"
                                defaultValue="#ffffff"
                                className="w-12 h-8 border-none rounded cursor-pointer"
                            />
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isPending}
                    >
                        {isPending ? 'Processing...' : 'Process Image'}
                    </button>
                </form>
                {error && (
                    <p className="text-red-400 mt-4 font-medium text-center">{error}</p>
                )}
            </div>
            {previewImage && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl bg-gradient-to-r from-purple-900 via-indigo-500 to-black rounded-xl overflow-hidden shadow-xl mb-8"
                >
                    <Image
                        src={previewImage}
                        alt="Processed Image"
                        width={600}
                        height={400}
                        className="w-full h-auto max-h-96 object-contain transition-transform duration-300 hover:scale-105"
                    />
                </motion.div>
            )}
            {downloadReady && (
                <a
                    href={previewImage}
                    download="converted_image.png"
                    className="w-full max-w-xs bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center mb-4"
                >
                    Download PNG
                </a>
            )}
            <Link
                href="/"
                className="w-full max-w-xs bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center"
            >
                Back to Home
            </Link>
        </motion.div>
    );
}



