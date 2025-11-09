document.addEventListener('DOMContentLoaded', function() {
    // 1. Thêm hiệu ứng cuộn mượt khi click vào các nút CTA trên banner
    document.querySelectorAll('.hero-ctas a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 2. Hiệu ứng hiển thị menu trên điện thoại (Nếu bạn phát triển giao diện responsive)
    // Giả sử bạn có một nút menu (ví dụ: <button class="menu-toggle">Menu</button>)
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // 3. Hiển thị thông báo khi nhấn nút Đặt Lịch (để thay thế bằng hệ thống booking thực tế sau này)
    document.querySelectorAll('.btn-cta').forEach(button => {
        button.addEventListener('click', function(e) {
            // Ngăn chặn chuyển hướng trang nếu là nút đặt lịch trên trang chủ
            if (this.getAttribute('href') === 'contact.html') {
                // Bạn có thể thêm code hiển thị popup đặt lịch ở đây
                console.log("Chuyển hướng đến trang Đặt Lịch...");
                // Nếu muốn giữ nguyên trang và chỉ thông báo:
                // alert('Vui lòng điền vào Form Đặt Lịch chi tiết tại trang Liên Hệ.');
            }
        });
    });
});