const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const FILENAME = 'burners_data.json';
const BASE = `https://api.github.com/gists/${GIST_ID}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  if (req.method === 'GET') {
    try {
      const resp = await fetch(BASE, { headers });
      const data = await resp.json();
      const file = data.files && data.files[FILENAME];
      if (file && file.content) {
        const record = JSON.parse(file.content);
        return res.status(200).json(record);
      }
      return res.status(200).json({});
    } catch (e) {
      return res.status(200).json({});
    }
  }

  if (req.method === 'POST') {
    try {
      const content = JSON.stringify(req.body);
      const resp = await fetch(BASE, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          files: {
            [FILENAME]: { content }
          }
        })
      });
      if (resp.ok) {
        return res.status(200).json({ ok: true });
      } else {
        const err = await resp.text();
        return res.status(500).json({ error: err });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
