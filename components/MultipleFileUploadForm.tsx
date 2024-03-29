import Image from "next/image";
import { ChangeEvent, MouseEvent, useState  } from "react";
import axios, { AxiosRequestConfig } from 'axios';

const MultipleFileUploadForm = () => {
	const [file, setFile] = useState<File | null>(null);
	const [progress, setProgress] = useState<number>(0);
	const [validFiles, setValidFiles] = useState<File[]>([]);

	const onFilesUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const fileInput = e.target;

		if (!fileInput.files) {
			alert("No files were chosen");
			return;
		}

		if (!fileInput.files || fileInput.files.length === 0) {
			alert("Files list is empty");
			return;
		}

		/** Files validation */
		const validFiles: File[] = [];
		for (let i = 0; i < fileInput.files.length; i++) {
			const file = fileInput.files[i];

			if (!["video/mp4", "audio/x-wav"].includes(file.type)) {
				alert(`File with idx: ${i} is invalid`);
				continue;
			}

			validFiles.push(file);
		}
		setValidFiles(validFiles)

		if (!validFiles.length) {
			alert("No valid files were chosen");
			return;
		}

		fileInput.type = "text";
		fileInput.type = "file";

	};

	const onCancelFile = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (!validFiles.length && !file) {
			return;
		}
		setFile(null);
	};

	const onUploadFile = async (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		if (validFiles.length === 0) {
			return;
		}

		try {
			var formData = new FormData();
			validFiles.forEach((file) => formData.append("media", file));

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

			const {
				data,
				error,
			}: {
				data: {
					url: string | string[];
				} | null;
				error: string | null;
			} = res.data;

			if (error || !data) {
				alert(error || "Sorry! something went wrong.");
				return;
			}

			console.log("Files were uploaded successfylly:", data);
		} catch (error) {
			console.error(error);
			alert("Sorry! something went wrong.");
		}
	}

	return (
		<form
			className="w-full p-3 border border-gray-500 border-dashed"
			onSubmit={(e) => e.preventDefault()}
		>
			<div className="flex flex-col md:flex-row gap-1.5 md:py-4">
				<div className="flex-grow">
					{validFiles.length > 0 ? (
						<>
							<button
								onClick={() => setValidFiles([])}
								className="mb-3 text-sm font-medium text-gray-500 transition-colors duration-300 hover:text-gray-900"
							>
								Clear Previews
							</button>

							<div className="flex flex-wrap justify-center">
								{validFiles.map((previewUrl, idx) => {
									return (
										previewUrl.type.startsWith('video') ? (
											<div key={idx} className="mx- my-5 w-80">
												<video controls className="w-full h-auto" width="320" height="218">
													<source src={URL.createObjectURL(previewUrl)} type="video/mp4" />
													Your browser does not support the video tag.
												</video>
											</div>
										) : (
											<div key={idx} className="mx-auto my-5 w-80">
												<audio controls className="w-full h-auto" style={{ maxWidth: '100%' }}>
													<source src={URL.createObjectURL(previewUrl)} />
													Your browser does not support the audio tag.
												</audio>
											</div>
										)
									);
								})}

							</div>
						</>
					) : (
						<label className="flex flex-col items-center justify-center h-full py-8 transition-colors duration-150 cursor-pointer hover:text-gray-600">
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
							<strong className="text-sm font-medium">Select images</strong>
							<input
								className="block w-0 h-0"
								name="file"
								type="file"
								onChange={onFilesUploadChange}
								multiple
							/>
						</label>
					)}
				</div>
				<div className="flex mt-4 md:mt-0 md:flex-col justify-center gap-1.5">
					<button
						disabled={!validFiles.length}
						onClick={onCancelFile}
						className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
					>
						Cancel file
					</button>
					<button
						disabled={!validFiles.length}
						onClick={onUploadFile}
						className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
					>
						Upload file
					</button>
					{progress !== 0 ? (
						<div
							className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
						>progress: {progress}</div>
					) : ""}
				</div>
			</div>
		</form>
	);
};

export default MultipleFileUploadForm;
