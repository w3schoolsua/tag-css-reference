document.addEventListener("DOMContentLoaded", () => {

    /* -------------------- THEME -------------------- */

    const themeToggle = document.getElementById("theme-toggle");

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        if (!themeToggle) return;

        const label = themeToggle.querySelector(".theme-toggle-label");
        const icon = themeToggle.querySelector(".theme-toggle-icon");

        if (!label || !icon) return;

        if (theme === "dark") {
            label.textContent = "Світла тема";
            icon.textContent = "☀️";
        } else {
            label.textContent = "Темна тема";
            icon.textContent = "🌙";
        }
    }

    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            applyTheme(current === "dark" ? "light" : "dark");
        });
    }

    /* -------------------- ELEMENTS / DOM -------------------- */

    const tbody = document.getElementById("elements-table-body");
    const countSpan = document.getElementById("elements-count");
    const searchInput = document.getElementById("search");
    const filterChips = document.querySelectorAll(".filter-chip");
    const sortableHeaders = document.querySelectorAll("th[data-sort-key]");

    if (!tbody) {
        console.error("tbody#elements-table-body не знайдено");
        return;
    }

    let allTags = [];
    let viewTags = [];
    let currentSort = { key: null, asc: true };


    /* -------------------- LOAD JSON -------------------- */

    fetch("tags.json")
        .then(r => r.json())
        .then(tags => {
            if (!Array.isArray(tags)) {
                console.error("tags.json не є масивом");
                return;
            }

            // Нормалізація статусу
            allTags = tags.map(t => ({
                ...t,
                status: (t.status || "standard").trim().toLowerCase()
            }));

            viewTags = [...allTags];

            renderTable(viewTags);
            updateCount(viewTags.length);

            initSearch();
            initFilters();
            initSorting();
        })
        .catch(err => {
            console.error("Помилка JSON:", err);
            if (countSpan) countSpan.textContent = "Елементів: помилка завантаження";
        });


    /* -------------------- RENDER TABLE -------------------- */

    function renderTable(list) {
        tbody.innerHTML = "";

        list.forEach(tag => {
            const tr = document.createElement("tr");
            tr.classList.add(`status-${tag.status}`);

            tr.innerHTML = `
                <td>
                    <a class="tag-code" href="${tag.specURL}" target="_blank" rel="noopener">
                        &lt;${tag.name}&gt;
                    </a>
                </td>
                <td>
                    <span class="description">${tag.description}</span>
                </td>
                <td>
                    <pre>${tag.defaultCSS}</pre>
                </td>
                <td>
                    <span class="status-label">${tag.status}</span>
                </td>
            `;

            tbody.appendChild(tr);
        });
    }

    function updateCount(n) {
        if (countSpan) countSpan.textContent = "Елементів: " + n;
    }

    /* -------------------- SEARCH -------------------- */

    function initSearch() {
        if (!searchInput) return;

        searchInput.addEventListener("input", () => {
            applyFiltersAndSearch();
        });
    }

    /* -------------------- FILTERS -------------------- */

    function initFilters() {
        if (!filterChips.length) return;

        filterChips.forEach(chip => {
            chip.addEventListener("click", () => {
                filterChips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");
                applyFiltersAndSearch();
            });
        });
    }

    function getActiveStatus() {
        const active = document.querySelector(".filter-chip.active");
        return active ? active.dataset.status : "all";
    }

    /* -------------------- APPLY FILTERS + SEARCH + SORT -------------------- */

    function applyFiltersAndSearch() {
        const q = (searchInput?.value || "").toLowerCase().trim();
        const status = getActiveStatus();

        let list = [...allTags];

        if (q) {
            list = list.filter(tag =>
                tag.name.toLowerCase().includes(q) ||
                tag.description.toLowerCase().includes(q) ||
                tag.defaultCSS.toLowerCase().includes(q)
            );
        }

        if (status !== "all") {
            list = list.filter(tag => tag.status === status);
        }

        if (currentSort.key) {
            list.sort((a, b) => {
                const A = (a[currentSort.key] || "").toLowerCase();
                const B = (b[currentSort.key] || "").toLowerCase();
                return currentSort.asc ? A.localeCompare(B) : B.localeCompare(A);
            });
        }

        viewTags = list;
        renderTable(viewTags);
        updateCount(viewTags.length);
    }

    /* -------------------- SORTING -------------------- */

    function initSorting() {
        if (!sortableHeaders.length) return;

        sortableHeaders.forEach(th => {
            th.addEventListener("click", () => {
                const key = th.dataset.sortKey;

                const isAsc = currentSort.key === key ? !currentSort.asc : true;
                currentSort = { key, asc: isAsc };

                sortableHeaders.forEach(h => h.classList.remove("sort-asc", "sort-desc"));
                th.classList.add(isAsc ? "sort-asc" : "sort-desc");

                applyFiltersAndSearch();
            });
        });
    }

});