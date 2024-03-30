import type { NextApiRequest, NextApiResponse } from "next";
import { parseForm, FormidableError } from "../../lib/parse-form";
import { exec, spawn } from 'child_process';

async function executePythonScript(scriptPath: string, args: string[]) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [scriptPath, ...args]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(stdoutData);
      } else {
        reject(new Error(`Python script exited with code ${code}. stderr: ${stderrData}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(error);
    });
  });
}

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<{
		data: {
			url: string | string[];
		} | null;
		error: string | null;
	}>
) => {
	if (req.method !== "POST") {
		res.setHeader("Allow", "POST");
		res.status(405).json({
			data: null,
			error: "Method Not Allowed",
		});
		return;
	}
	// Just after the "Method Not Allowed" code
	try {
		const { fields, files } = await parseForm(req);

		// console.log("file : ", files)
		var urls: string[] = []
		files.map(ele => {
			const file = ele.media;
			let url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
			urls.push(String(url));
		})

		const scriptPath = `inference.py`;

		const args = [`${urls[0]}`, './uploads/30-03-2024/converted.mp4'];

		try {
			const output = await executePythonScript(scriptPath, args);
			console.log('Python script output:', output);
		} catch (error) {
			console.error('Error executing Python script:', error);
		}
	

		// chmod +x script.py

		// exec(`chmod +x ${urls[0]}`, (error, stdout, stderr) => {
		// 	if (error) {
		// 		console.error(`chmod error : ${error}`);
		// 		return;
		// 	}
		// 	console.log(`chmod output: ${stdout}`);
		// });


		// exec(`python3 "${scriptPath}"`, (error, stdout, stderr) => {
		// 	if (error) {
		// 		console.error(`Error executing Python script: ${error}`);
		// 		return;
		// 	}
		// 	console.log(`Python script output: ${stdout}`);
		// });

		res.status(200).json({
			data: {
				url: urls,
			},
			error: null,
		});
	} catch (e) {
		if (e instanceof FormidableError) {
			res.status(e.httpCode || 400).json({ data: null, error: e.message });
		} else {
			console.error(e);
			res.status(500).json({ data: null, error: "Internal Server Error" });
		}
	}
};

export const config = {
	api: {
		bodyParser: false,
	},
};

export default handler;
