// import Link from "next/link";
// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="container">
//       <h1 className="text-5xl font-bold mb-6 text-shadow-md">
//         Welcome to Image Converter
//       </h1>
//       <p className="text-xl leading-7 mb-8 text-gray-200 max-w-md mx-auto">
//         Effortlessly convert any image to PNG or remove backgrounds to create
//         transparent images with our simple and fast tool.
//       </p>
//       <Link href="/converter" className="btn">
//         Start Converting
//       </Link>
//       <div className="preview-container">
//         <Image
//           src="/front.jpg"
//           alt="Sample Image"
//           width={600}
//           height="400"
//           className="preview-img"
//         />
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-shadow-md">
        Welcome to Image Converter
      </h1>
      <p className="text-lg sm:text-xl leading-7 mb-8 text-gray-200">
        Effortlessly convert any image to PNG or remove backgrounds to create
        transparent images with our simple and fast tool.
      </p>
      <Link href="/converter" className="btn mb-8">
        Start Converting
      </Link>
      <div className="preview-container">
        <Image
          src="/front.jpg"
          alt="Sample"
          width={600}
          height={400}
          className="preview-img"
        />
      </div>
    </motion.div>
  );
}
