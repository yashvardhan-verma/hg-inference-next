import Image from "next/image";
import { ChangeEvent, MouseEvent, useState } from "react";
import axios, { AxiosRequestConfig } from 'axios';

const SingleFileUploadForm = () => {
	const [file, setFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [fileType, setFileType] = useState<string | null>(null);
	const [progress, setProgress] = useState<number>(0);

	const onFileUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
		const fileInput = e.target;

		if (!fileInput.files) {
			alert("No file was chosen");
			return;
		}

		if (!fileInput.files || fileInput.files.length === 0) {
			alert("Files list is empty");
			return;
		}

		const file = fileInput.files[0];

		// console.log("--------file----------", file)
		/** File validation */
		// if (!file.type.startsWith("image")) {
		//   alert("Please select a valide image");
		//   return;
		// }

		/** Setting file state */
		setFile(file); // we will use the file state, to send it later to the server
		if (file.type.startsWith('video/')) {
			setFileType('video')
			setPreviewUrl(URL.createObjectURL(file));
		}
		else if (file.type.startsWith('audio/')) {
			setFileType('video')
			setPreviewUrl(URL.createObjectURL(file));
		}
		else {
			console.error('Invalid file type. Only video and audio files are supported.');
		}
		// we will use this to show the preview of the image

		/** Reset file input */
		e.currentTarget.type = "text";
		e.currentTarget.type = "file";
	};

	const onCancelFile = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (!previewUrl && !file) {
			return;
		}
		setFile(null);
		setPreviewUrl(null);
	};

	const onUploadFile = async (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		if (!file) {
			return;
		}

		try {
			var formData = new FormData();
			formData.append("media", file);

			const config: AxiosRequestConfig = {
				// Type assertion to inform TypeScript about the additional property
				onUploadProgress: (progressEvent) => {
					if (progressEvent.total !== undefined) {
						const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						setProgress(percentCompleted)
						console.log(`Upload Progress: ${percentCompleted}%`);
					} else {
						console.log('Upload Progress: Unable to compute.');
					}
				},
			};

			const res = await axios.post("/api/upload", formData, config);

			console.log("res", res)

			const {
				data,
				error,
			}: {
				data: { url: string | string[]; } | null;
				error: string | null;
			} = res.data;

			if (error || !data) {
				alert(error || "Sorry! something went wrong.");
				return;
			}

			console.log("File was uploaded successfylly:", data);
		} catch (error) {
			console.error(error);
			alert("Sorry! something went wrong.");
		}
	};


	console.log("previewUrl", previewUrl)
	return (
		<form
			className="w-full p-3 border border-gray-500 border-dashed"
			onSubmit={(e) => e.preventDefault()}
		>
			<div className="flex flex-col md:flex-row gap-1.5 md:py-4">
				<div className="flex-grow">
					{previewUrl ? (
						fileType === 'video' ? (
							<div className="mx-auto w-80">
								<video controls className="w-full h-auto" width="320" height="218">
									<source src={previewUrl} type="video/mp4" />
									Your browser does not support the video tag.
								</video>
							</div>) : (
								<div className="mx-auto w-80">
								<audio controls className="w-full h-auto" style={{ maxWidth: '100%' }}>
									<source src={previewUrl} />
									Your browser does not support the audio tag.
								</audio>
							</div>
							
							)
					) : (
						<label className="flex flex-col items-center justify-center h-full py-3 transition-colors duration-150 cursor-pointer hover:text-gray-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-14 h-14"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
								/>
							</svg>
							<strong className="text-sm font-medium">Select File</strong>
							<input
								className="block w-0 h-0"
								name="file"
								type="file"
								onChange={onFileUploadChange}
							/>
						</label>
					)}
				</div>
				<div className="flex mt-4 md:mt-0 md:flex-col justify-center gap-1.5">
					<button
						disabled={!previewUrl}
						onClick={onCancelFile}
						className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
					>
						Cancel file
					</button>
					<button
						disabled={!previewUrl}
						onClick={onUploadFile}
						className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
					>
						Upload file
					</button>
					{progress !== 0? (
						<div
						className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
					>progress: {progress}</div>
					): ""}
				</div>
			</div>
		</form>
	);
};

export default SingleFileUploadForm;
