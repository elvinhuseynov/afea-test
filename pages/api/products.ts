import axios from "axios";

const instance = axios.create({
  baseURL: "https://dummyjson.com",
});

export const getProducts= async () => {
  const { data } = await instance.get("/products");
  return data;
};
