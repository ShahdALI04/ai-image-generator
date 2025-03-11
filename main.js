
const deepAiApiKey = " a63fcd17-4961-405c-8b3d-ea89564e1511"; // استبدله بمفتاحك من DeepAI
const pexelsApiKey = "cYy4cr0gFZdwwcPpK23aZ6my70PGVGAnUCU18SxqOIuvFofPRHDGbFGU"; // استبدله بمفتاحك من Pexels

const inp = document.getElementById('inp');
const images = document.querySelector('.images');

const getImage = async () => {
    images.innerHTML = "<p>Loading...</p>"; // إظهار رسالة تحميل أثناء جلب الصور

    try {
        // المحاولة الأولى باستخدام DeepAI
        const deepAiResponse = await fetch("https://api.deepai.org/api/text2img", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": deepAiApiKey
            },
            body: JSON.stringify({ text: inp.value })
        });

        const deepAiData = await deepAiResponse.json();
        if (deepAiData.output_url) {
            displayImages([deepAiData.output_url]); // عرض الصورة من DeepAI
            return;
        } else {
            throw new Error("DeepAI failed, switching to Pexels...");
        }
    } catch (error) {
        console.warn(error.message); // طباعة سبب الفشل في DeepAI

        // المحاولة الثانية باستخدام Pexels إذا فشل DeepAI
        try {
            const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${inp.value}&per_page=6`, {
                headers: {
                    "Authorization": pexelsApiKey
                }
            });

            const pexelsData = await pexelsResponse.json();
            if (pexelsData.photos.length > 0) {
                const imageUrls = pexelsData.photos.map(photo => photo.src.medium);
                displayImages(imageUrls); // عرض الصور من Pexels
                return;
            } else {
                throw new Error("No images found on Pexels.");
            }
        } catch (pexelsError) {
            console.error("Error fetching images:", pexelsError);
            images.innerHTML = "<p>Sorry, no images found.</p>";
        }
    }
};
let imageCount = 6; 

const loadMoreImages = async () => {
    imageCount += 6; // زيادة عدد الصور في كل مرة

    try {
        const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${inp.value}&per_page=${imageCount}`, {
            headers: {
                "Authorization": pexelsApiKey
            }
        });

        const pexelsData = await pexelsResponse.json();

        if (pexelsData.photos.length > 0) {
            const imageUrls = pexelsData.photos.map(photo => photo.src.medium);
            displayImages(imageUrls);
        } else {
            document.getElementById("showMore").style.display = "none"; // إخفاء الزر إذا لم توجد صور جديدة
        }
    } catch (error) {
        console.error("Error fetching more images:", error);
        document.getElementById("showMore").style.display = "none"; // إخفاء الزر عند حدوث خطأ
    }
};


const displayImages = (imageUrls) => {
    images.innerHTML = "";
    imageUrls.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.style.width = "200px";
        img.style.height = "200px";
        img.style.margin = "10px";
        images.appendChild(img);
    });

    // زر "Show More" لن يظهر إلا بعد عرض 6 صور على الأقل
    const showMoreBtn = document.getElementById("showMore");
    if (imageUrls.length >= 6) {
        showMoreBtn.style.display = "inline"; // إظهار الزر
    } else {
        showMoreBtn.style.display = "none"; // إخفاؤه
    }
};
