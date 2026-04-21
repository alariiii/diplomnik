import axios from 'axios';

export const uploadAndGetLink = async (folderPath, fileName, fileBuffer) => {
  const TOKEN = process.env.YANDEX_DISK_TOKEN;
  if (!TOKEN) throw new Error("YANDEX_DISK_TOKEN is not defined in .env");

  const api = axios.create({
    baseURL: 'https://cloud-api.yandex.net/v1/disk/resources',
    headers: { Authorization: `OAuth ${TOKEN}` }
  });

  // 1. Создаем корневую папку, если её нет
  try {
    await api.put(`?path=${encodeURIComponent('diplomnik_files')}`);
  } catch (error) {
    if (error.response?.status !== 409) throw error;
  }

  // 2. Создаем папку пользователя
  try {
    await api.put(`?path=${encodeURIComponent(folderPath)}`);
  } catch (error) {
    if (error.response?.status !== 409) throw error;
  }

  // 3. Получаем ссылку для загрузки
  const fullPath = `${folderPath}/${fileName}`;
  const { data } = await api.get(`/upload?path=${encodeURIComponent(fullPath)}&overwrite=true`);

  // 4. Загружаем файл (отправляем буфер файла)
  await axios.put(data.href, fileBuffer);

  // 5. Делаем файл публичным
  await api.patch(`/publish?path=${encodeURIComponent(fullPath)}`);
  
  // 6. Получаем и возвращаем публичную ссылку
  const res = await api.get(`?path=${encodeURIComponent(fullPath)}`);
  return res.data.public_url;
};