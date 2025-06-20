export async function getVideoUrl(name: string) {
  const url = `https://ae6b-2406-7400-9a-d6e-1686-8279-b7ae-b556.ngrok-free.app/generatevideo?name=${name}`;
  try {
    console.log("inside get video url");
    const response = await fetch(url);
    const data = await response.json(); // or response.json() depending on your API
    console.log(data, "dataaaa");
    return data;
  } catch (error) {
    console.log(url)
    console.error("Error calling API:", error);
  }
}
