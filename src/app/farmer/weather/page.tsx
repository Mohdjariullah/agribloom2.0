import { redirect } from "next/navigation";

export default function FarmerWeatherRedirect() {
  redirect("/weather");
}
