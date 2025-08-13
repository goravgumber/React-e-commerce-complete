const axios = require("axios");
const fs = require("fs");
const path = require("path");

const IMAGE_DIR = path.join(__dirname, "public/images");

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

const images = [
  {
    filename: "laptop.jpg",
    url: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "headphones.jpg",
    url: "https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "shoes.jpg",
    url: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "camera.jpg",
    url: "https://images.pexels.com/photos/212372/pexels-photo-212372.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "watch.jpg",
    url: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "tablet.jpg",
    url: "https://images.pexels.com/photos/5077043/pexels-photo-5077043.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "smartphone.jpg",
    url: "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "keyboard.jpg",
    url: "https://images.pexels.com/photos/459654/pexels-photo-459654.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "backpack.jpg",
    url: "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "bottle.jpg",
    url: "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "tshirt.jpg",
    url: "https://images.pexels.com/photos/1002638/pexels-photo-1002638.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "jacket.jpg",
    url: "https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "wallet.jpg",
    url: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "monitor.jpg",
    url: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "mouse.jpg",
    url: "https://images.pexels.com/photos/461077/pexels-photo-461077.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "drone.jpg",
    url: "https://images.pexels.com/photos/1300260/pexels-photo-1300260.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "sunglasses.jpg",
    url: "https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "fitness-band.jpg",
    url: "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "speaker.jpg",
    url: "https://images.pexels.com/photos/1668991/pexels-photo-1668991.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "hoodie.jpg",
    url: "https://images.pexels.com/photos/100337/pexels-photo-100337.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "tripod.jpg",
    url: "https://images.pexels.com/photos/416430/pexels-photo-416430.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "cap.jpg",
    url: "https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "earbuds.jpg",
    url: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "sneakers.jpg",
    url: "https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "mousepad.jpg",
    url: "https://images.pexels.com/photos/3945656/pexels-photo-3945656.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "projector.jpg",
    url: "https://images.pexels.com/photos/9477857/pexels-photo-9477857.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "stylus.jpg",
    url: "https://images.pexels.com/photos/9430966/pexels-photo-9430966.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "desk-lamp.jpg",
    url: "https://images.pexels.com/photos/1437318/pexels-photo-1437318.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "gaming-controller.jpg",
    url: "https://images.pexels.com/photos/845255/pexels-photo-845255.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    filename: "tablet-pen.jpg",
    url: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
];


const downloadImage = async (url, filename) => {
  const filePath = path.join(IMAGE_DIR, filename);
  const writer = fs.createWriteStream(filePath);

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream"
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log(`✅ Saved: ${filename}`);
        resolve();
      });
      writer.on("error", reject);
    });
  } catch (err) {
    console.error(`❌ Failed: ${filename} - ${err.message}`);
  }
};

const run = async () => {
  console.log("📦 Downloading images...");
  for (const image of images) {
    await downloadImage(image.url, image.filename);
  }
  console.log("🎉 Done downloading all images!");
};

run();
