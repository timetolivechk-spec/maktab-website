// Supabase kutubxonasini CDN orqali chaqirish
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// O'ZINGIZNING SUPABASE MA'LUMOTLARINGIZNI SHU YERGA KIRITING
const SUPABASE_URL = 'https://teetswqmojrnaysioxor.supabase.co'
const SUPABASE_ANON_KEY = 'sb_secret_KKmwBuRdzNJreAG2keYHxw_5Sc34E9C'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// DOM elementlari
const newsContainer = document.getElementById('news-container');
const loadingText = document.getElementById('loading-news');
const contactForm = document.getElementById('contact-form');
const formAlert = document.getElementById('form-alert');
const submitBtn = document.getElementById('submit-btn');

/**
 * 1. Yangiliklarni Supabase'dan yuklab olish va HTML ga yozish
 */
async function fetchNews() {
    try {
        const { data: news, error } = await supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Agar yangiliklar bo'lmasa
        if (!news || news.length === 0) {
            loadingText.innerHTML = "Hozircha yangiliklar yo'q.";
            return;
        }

        // Yuklanmoqda yozuvini olib tashlash
        newsContainer.innerHTML = '';

        // Har bir yangilikni HTML ga joylash
        news.forEach(item => {
            const dateObj = new Date(item.date || item.created_at);
            const formattedDate = dateObj.toLocaleDateString('uz-UZ');
            
            // Default rasm o'rnatish
            const imageUrl = item.image_url ? item.image_url : 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop';

            const newsCard = `
                <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    <img src="${imageUrl}" alt="Yangilik rasmi" class="w-full h-48 object-cover">
                    <div class="p-6 flex-1 flex flex-col">
                        <span class="text-blue-600 text-sm font-semibold mb-2">${formattedDate}</span>
                        <h3 class="text-xl font-bold text-gray-900 mb-3">${item.title}</h3>
                        <p class="text-gray-600 line-clamp-3 mb-4 flex-1">${item.content}</p>
                        <a href="#" class="text-blue-700 font-semibold hover:underline mt-auto">To'liq o'qish &rarr;</a>
                    </div>
                </div>
            `;
            newsContainer.insertAdjacentHTML('beforeend', newsCard);
        });

    } catch (error) {
        console.error("Yangiliklarni yuklashda xato:", error.message);
        loadingText.innerHTML = "Yangiliklarni yuklashda xatolik yuz berdi.";
    }
}

/**
 * 2. Murojaat formasi yuborilganda Supabase'ga ma'lumot yozish
 */
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Tugmani o'chirish va holatini o'zgartirish
    submitBtn.disabled = true;
    submitBtn.textContent = 'Yuborilmoqda...';
    formAlert.classList.add('hidden');

    const fullName = document.getElementById('full_name').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    try {
        const { error } = await supabase
            .from('contacts')
            .insert([
                { full_name: fullName, phone: phone, message: message }
            ]);

        if (error) throw error;

        // Muvaffaqiyatli yuborilsa
        showAlert("Murojaatingiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz.", "bg-green-500");
        contactForm.reset(); // Formani tozalash

    } catch (error) {
        console.error("Murojaatni yuborishda xato:", error.message);
        showAlert("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.", "bg-red-500");
    } finally {
        // Tugmani asliga qaytarish
        submitBtn.disabled = false;
        submitBtn.textContent = 'Xabarni yuborish';
    }
});

// Xabar chiqarish funksiyasi
function showAlert(text, colorClass) {
    // Oldingi ranglarni olib tashlash
    formAlert.classList.remove('bg-green-500', 'bg-red-500');
    
    formAlert.textContent = text;
    formAlert.classList.add(colorClass);
    formAlert.classList.remove('hidden');

    // 5 soniyadan keyin xabarni yashirish
    setTimeout(() => {
        formAlert.classList.add('hidden');
    }, 5000);
}

// Sahifa yuklanganda yangiliklarni olib kelish funksiyasini ishga tushirish
document.addEventListener('DOMContentLoaded', fetchNews);