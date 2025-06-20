export async function getVideoUrl(name: string) {
  const url = `http://13.201.128.201:3001/generatevideo?name=${name}`;
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
