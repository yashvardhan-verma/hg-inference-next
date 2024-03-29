import type { NextApiRequest, NextApiResponse } from "next";
import { parseForm, FormidableError } from "../../lib/parse-form";

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
		// const file = files.media;
		// let url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;


		console.log("url",urls)
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
