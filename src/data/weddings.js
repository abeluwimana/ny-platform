import doteImg from "../assets/images/eric.jpeg";
import receptionImg from "../assets/images/hero.png";
import churchImg from "../assets/images/traditional.jpeg";

const defaultWeddings = [
  {
    id: "eric-diane",
    couple: "Eric & Diane",
    location: "Kigali",
    events: {
      dote: {
        title: "Traditional Ceremony",
        image: doteImg,
        video: "https://www.youtube.com/embed/sn1DteOIg0M",
      },
      church: {
        title: "Church Wedding",
        image: churchImg,
        video: "https://www.youtube.com/embed/sn1DteOIg0M",
      },
      reception: {
        title: "Reception",
        image: receptionImg,
        video: "https://www.youtube.com/embed/sn1DteOIg0M",
      },
    },
  },
];

export const weddings =
  JSON.parse(localStorage.getItem("weddings")) || defaultWeddings;