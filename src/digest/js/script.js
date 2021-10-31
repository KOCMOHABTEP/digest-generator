window.onload = function () {
    console.debug("Digest script loaded....")
    var anchors = document.querySelectorAll('[data-custom-anchor]');
    var customScrollTo = function (element) {
        var bitrixHeader = document.querySelector('[data-menu-prop="menu-header"]');
        var bitrixHeaderOffset = bitrixHeader ? bitrixHeader.offsetHeight : 0;

        window.scrollTo({
            behavior: 'smooth',
            top: element.offsetTop - bitrixHeaderOffset
        })
    };

    anchors.forEach(function (item) {
        item.addEventListener("click", function (event) {
            event.preventDefault();

            var anchor = event.target;
            var attr = anchor.getAttribute("href");
            var destinationElement = document.querySelector(attr);

            if (!attr || !destinationElement) return;

            customScrollTo(destinationElement);
        })
    })
};