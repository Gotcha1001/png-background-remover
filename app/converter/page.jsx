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

import { useState, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Converter() {
    const [previewImage, setPreviewImage] = useState(null);
    const [foregroundImage, setForegroundImage] = useState(null);
    const [error, setError] = useState(null);
    const [downloadReady, setDownloadReady] = useState(false);
    const [backgroundOption, setBackgroundOption] = useState('transparent');
    const [isPending, startTransition] = useTransition();
    const [bodyPixModel, setBodyPixModel] = useState(null);
    const [selfieSegmentation, setSelfieSegmentation] = useState(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);

    // Load MediaPipe Selfie Segmentation
    const loadMediaPipeModel = async () => {
        try {
            // Load MediaPipe script dynamically
            if (!window.SelfieSegmentation) {
                await new Promise((resolve, reject) => {
                    const script1 = document.createElement('script');
                    script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
                    script1.onload = () => {
                        const script2 = document.createElement('script');
                        script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js';
                        script2.onload = () => {
                            const script3 = document.createElement('script');
                            script3.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
                            script3.onload = () => {
                                const script4 = document.createElement('script');
                                script4.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
                                script4.onload = resolve;
                                script4.onerror = reject;
                                document.head.appendChild(script4);
                            };
                            script3.onerror = reject;
                            document.head.appendChild(script3);
                        };
                        script2.onerror = reject;
                        document.head.appendChild(script2);
                    };
                    script1.onerror = reject;
                    document.head.appendChild(script1);
                });
            }

            const selfieSegmentation = new window.SelfieSegmentation({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
                }
            });

            selfieSegmentation.setOptions({
                modelSelection: 1, // 0 for general, 1 for landscape
                selfieMode: false,
            });

            setSelfieSegmentation(selfieSegmentation);
            return selfieSegmentation;
        } catch (error) {
            console.error('MediaPipe load failed:', error);
            return null;
        }
    };

    // Load BodyPix as fallback
    const loadBodyPixModel = async () => {
        try {
            // Load TensorFlow.js and BodyPix from CDN
            if (!window.tf) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            if (!window.bodyPix) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.2.1/dist/body-pix.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            const model = await window.bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                multiplier: 0.75,
                quantBytes: 2,
            });

            setBodyPixModel(model);
            return model;
        } catch (error) {
            console.error('BodyPix load failed:', error);
            return null;
        }
    };

    // Initialize models
    useEffect(() => {
        const initModels = async () => {
            if (isModelLoaded) return;

            toast.info("Loading AI models... (first time only)");

            // Try MediaPipe first, then BodyPix as fallback
            const mediaPipeModel = await loadMediaPipeModel();
            if (!mediaPipeModel) {
                const bodyPixModel = await loadBodyPixModel();
                if (bodyPixModel) {
                    setIsModelLoaded(true);
                    toast.success("Background removal ready!");
                }
            } else {
                setIsModelLoaded(true);
                toast.success("Advanced background removal ready!");
            }
        };

        initModels();
    }, [isModelLoaded]);

    // MediaPipe background removal
    const processWithMediaPipe = async (imageElement) => {
        return new Promise((resolve, reject) => {
            if (!selfieSegmentation) {
                reject(new Error('MediaPipe not loaded'));
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = imageElement.width;
            canvas.height = imageElement.height;
            const ctx = canvas.getContext('2d');

            selfieSegmentation.onResults((results) => {
                if (!results.segmentationMask) {
                    reject(new Error('No segmentation mask'));
                    return;
                }

                // Draw original image
                ctx.drawImage(imageElement, 0, 0);

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const { data } = imageData;

                // Create temporary canvas for mask
                const maskCanvas = document.createElement('canvas');
                maskCanvas.width = canvas.width;
                maskCanvas.height = canvas.height;
                const maskCtx = maskCanvas.getContext('2d');
                maskCtx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

                const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height).data;

                // Apply mask
                for (let i = 0; i < data.length; i += 4) {
                    const maskValue = maskData[i]; // Red channel of mask
                    if (maskValue < 128) { // Background pixels
                        data[i + 3] = 0; // Set alpha to 0 (transparent)
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            });

            // Send image to MediaPipe
            selfieSegmentation.send({ image: imageElement });
        });
    };

    // BodyPix background removal
    const processWithBodyPix = async (imageElement) => {
        if (!bodyPixModel) {
            throw new Error('BodyPix model not loaded');
        }

        const segmentation = await bodyPixModel.segmentPerson(imageElement, {
            flipHorizontal: false,
            internalResolution: 'medium',
            segmentationThreshold: 0.7,
        });

        const canvas = document.createElement('canvas');
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        const ctx = canvas.getContext('2d');

        // Draw original image
        ctx.drawImage(imageElement, 0, 0);

        // Apply segmentation mask
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;

        for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = i / 4;
            if (segmentation.data[pixelIndex] === 0) { // Background pixel
                data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL('image/png');
    };

    // Enhanced color-based background removal
    const enhancedBackgroundRemoval = async (imageElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(imageElement, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;

        // Enhanced edge detection and background removal
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Multiple background detection criteria
            const isWhiteBackground = r > 230 && g > 230 && b > 230;
            const isBlackBackground = r < 25 && g < 25 && b < 25;
            const isGrayBackground = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
            const isGreenScreen = g > r + 30 && g > b + 30;
            const isBlueScreen = b > r + 30 && b > g + 30;

            // Edge pixels (keep these to preserve subject outline)
            const isEdgePixel = (i % (canvas.width * 4)) < 8 ||
                (i % (canvas.width * 4)) > (canvas.width - 2) * 4 ||
                i < canvas.width * 4 * 2 ||
                i > data.length - canvas.width * 4 * 2;

            if ((isWhiteBackground || isBlackBackground || isGrayBackground || isGreenScreen || isBlueScreen) && !isEdgePixel) {
                data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL('image/png');
    };

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

                const img = new window.Image();
                img.src = imgUrl;

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                let foregroundBase64 = null;

                if (removeBg) {
                    try {
                        toast.info("Removing background with AI...");

                        // Try MediaPipe first
                        if (selfieSegmentation) {
                            foregroundBase64 = await processWithMediaPipe(img);
                        }
                        // Then try BodyPix
                        else if (bodyPixModel) {
                            foregroundBase64 = await processWithBodyPix(img);
                        }
                        // Finally fallback to enhanced method
                        else {
                            foregroundBase64 = await enhancedBackgroundRemoval(img);
                        }
                    } catch (aiError) {
                        console.warn('AI background removal failed, using enhanced method:', aiError);
                        toast.warning('AI removal failed, using enhanced processing');
                        foregroundBase64 = await enhancedBackgroundRemoval(img);
                    }
                } else {
                    // Standard image processing without background removal
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');

                    if (backgroundOption === 'transparent') {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    } else if (backgroundOption === 'color') {
                        ctx.fillStyle = backgroundColor;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }

                    ctx.drawImage(img, 0, 0);
                    foregroundBase64 = canvas.toDataURL('image/png');
                }

                let outputBase64 = foregroundBase64;

                // Handle custom background image
                if (backgroundOption === 'image' && bgFile && bgFile.size > 0) {
                    const bgImg = new window.Image();
                    bgImgUrl = URL.createObjectURL(bgFile);
                    bgImg.src = bgImgUrl;

                    await new Promise((resolve, reject) => {
                        bgImg.onload = resolve;
                        bgImg.onerror = reject;
                    });

                    const fgImg = new window.Image();
                    fgImg.src = foregroundBase64;

                    await new Promise((resolve, reject) => {
                        fgImg.onload = resolve;
                        fgImg.onerror = reject;
                    });

                    const compositeCanvas = document.createElement('canvas');
                    compositeCanvas.width = Math.max(bgImg.width, fgImg.width);
                    compositeCanvas.height = Math.max(bgImg.height, fgImg.height);
                    const compositeCtx = compositeCanvas.getContext('2d');

                    // Draw background image, scaled to fill canvas
                    compositeCtx.drawImage(bgImg, 0, 0, compositeCanvas.width, compositeCanvas.height);

                    // Center the foreground image
                    const fgWidth = fgImg.width;
                    const fgHeight = fgImg.height;
                    const xOffset = (compositeCanvas.width - fgWidth) / 2;
                    const yOffset = (compositeCanvas.height - fgHeight) / 2;

                    compositeCtx.drawImage(fgImg, xOffset, yOffset, fgWidth, fgHeight);
                    outputBase64 = compositeCanvas.toDataURL('image/png');
                }

                setPreviewImage(outputBase64);
                setForegroundImage(foregroundBase64);
                setDownloadReady(true);
                toast.success("Image converted successfully!");

            } catch (err) {
                console.error('Image processing error:', err);
                setError(`Error processing image: ${err.message}`);
                toast.error("Failed to process image");
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
                AI-Powered Image Converter
            </h1>

            <div className="w-full max-w-lg bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-6 sm:p-8 mb-8 shadow-2xl">
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col space-y-6">
                    <div className="flex flex-col items-center">
                        <label
                            htmlFor="file-input"
                            className="inline-block bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                        >
                            Choose Image
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
                            />
                            Remove Background (MediaPipe + BodyPix AI)
                        </label>
                    </div>

                    {!isModelLoaded && (
                        <div className="text-center text-yellow-300 text-sm">
                            🤖 AI models loading in background...
                        </div>
                    )}

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
                            Custom Background Image
                        </label>

                        {backgroundOption === 'image' && (
                            <div className="flex flex-col items-center">
                                <label
                                    htmlFor="bg-file-input"
                                    className="inline-block bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 px-6 rounded-lg font-semibold shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
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
                            Solid Color Background
                        </label>

                        {backgroundOption === 'color' && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    name="background_color"
                                    defaultValue="#ffffff"
                                    className="w-12 h-8 border-none rounded cursor-pointer"
                                />
                                <span className="text-sm text-gray-300">Choose color</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-green-400 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isPending}
                    >
                        {isPending ? 'Processing...' : 'Convert to PNG'}
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
                className="w-full max-w-xs bg-gradient-to-r from-gray-600 to-gray-500 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center"
            >
                Back to Home
            </Link>
        </motion.div>
    );
}