
export async function getVideoUrl(name: string) {
  try {
    const response = await fetch(
      `http://13.201.128.201:3001/generatevideo?name=${name}`
    );
    const data = await response.json(); // or response.json() depending on your API
    console.log(data, "dataaaa");
    return data
  } catch (error) {
    console.error("Error calling API:", error);
  }
}
