# Vòng Quay May Mắn 🎰

Ứng dụng vòng quay may mắn được xây dựng bằng HTML, CSS và JavaScript thuần — không cần framework hay build tool.

## Tính năng

- Vòng quay với 14 giải thưởng, mỗi giải có xác suất trúng khác nhau (dựa trên trọng số)
- Hiệu ứng quay mượt mà với chuyển động giảm tốc thực tế
- Vòng đèn LED nhấp nháy theo nhịp quay
- Hiển thị kết quả qua modal với hiệu ứng confetti
- Lịch sử các lượt quay (tối đa 20 lượt gần nhất)
- Danh sách giải thưởng hiển thị trực quan
- Hỗ trợ bàn phím: `Space` / `Enter` để quay, `Esc` để đóng modal
- Giao diện responsive, tương thích mobile

## Cách sử dụng

Mở file `lucky-wheel/index.html` trực tiếp trên trình duyệt. Không cần cài đặt hay build.

## Cấu trúc dự án

```
lucky-wheel/
├── index.html       # Giao diện chính
├── css/
│   └── style.css    # Toàn bộ style, sử dụng CSS custom properties
└── js/
    └── app.js       # Logic ứng dụng (vẽ wheel, quay, kết quả, lịch sử)
```

## Tùy chỉnh giải thưởng

Chỉnh sửa mảng `PRIZES` ở đầu file `lucky-wheel/js/app.js`:

```js
const PRIZES = [
    { label: 'Tên giải', emoji: '🎁', color: '#ff6b6b', weight: 5 },
    // ...
];
```

- `label` — tên giải thưởng hiển thị trên vòng quay
- `emoji` — biểu tượng đại diện
- `color` — màu sắc của ô (mã hex)
- `weight` — trọng số xác suất (số càng lớn, xác suất trúng càng cao)

## Công nghệ sử dụng

- HTML5 Canvas — vẽ vòng quay
- CSS3 — animation, glassmorphism, responsive
- Vanilla JavaScript — không dùng framework hay thư viện ngoài
- Google Fonts (Outfit)
