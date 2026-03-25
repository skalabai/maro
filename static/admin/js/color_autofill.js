document.addEventListener('DOMContentLoaded', function () {
    const colorInput = document.getElementById('id_color_name');
    const hexInput = document.getElementById('id_color_hex');

    if (!colorInput || !hexInput) return;

    const colorMap = {
        'черный': '#000000',
        'чёрный': '#000000',
        'белый': '#ffffff',
        'красный': '#ff0000',
        'синий': '#0000ff',
        'зеленый': '#008000',
        'жёлтый': '#ffff00',
        'серый': '#808080',
        'коричневый': '#8b4513',
        'розовый': '#ffc0cb',
        'фиолетовый': '#800080',
        'оранжевый': '#ffa500',
        'бежевый': '#f5f5dc',
        'бордовый': '#800000',
        'голубой': '#add8e6',
        'темно-синий': '#00008b',
        'золотой': '#ffd700',
        'серебряный': '#c0c0c0',
        'оливковый': '#808000',
        'хаки': '#f0e68c'
    };

    colorInput.addEventListener('input', function () {
        const colorName = this.value.toLowerCase().trim();

        // Find exact match first
        if (colorMap[colorName]) {
            hexInput.value = colorMap[colorName];
            return;
        }

        // Basic partial matching just in case (e.g. "светло-серый")
        for (const [key, hex] in Object.entries(colorMap)) {
            if (colorName.includes(key)) {
                hexInput.value = hex;
                break;
            }
        }
    });
});
