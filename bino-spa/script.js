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

    // 2. Hiệu ứng hiển thị menu trên điện thoại (ĐÃ SỬA)
    const menuToggle = document.querySelector('.menu-toggle');
    // Thay vì chọn .main-nav, hãy chọn trực tiếp <ul> bên trong
    const mainNavUl = document.querySelector('.main-nav ul'); 
    
    // Nếu bạn muốn hiển thị/ẩn nút menu toggle bằng CSS, bạn có thể bỏ dòng 'this.classList.toggle('active');'
    // Tuy nhiên, việc toggle class active trên nút menu cũng là một pattern tốt để thay đổi icon (ví dụ: ☰ thành X)

    if (menuToggle && mainNavUl) { // Kiểm tra cả <ul>
        menuToggle.addEventListener('click', function() {
            // SỬA: Thêm/Bỏ class 'active' vào thẻ <ul> (đúng với CSS: .main-nav ul.active)
            mainNavUl.classList.toggle('active');
            // Giữ lại dòng này nếu bạn muốn thay đổi style cho nút ☰ khi menu mở
            this.classList.toggle('active'); 
        });
    }

    // 3. Hiển thị thông báo khi nhấn nút Đặt Lịch
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
