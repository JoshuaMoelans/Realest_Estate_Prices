{/* We hope that these classes are static, else detecting the elements becomes tricky
    
<span class="Text-sc-10o2fdq-0 sc-b4c02c1e-3 kncxJj jkHUJf" data-testid="search-result-entry-price-1714464299">€ 393</span>
<span class="Text-sc-10o2fdq-0 sc-b4c02c1e-3 kncxJj jkHUJf" data-testid="search-result-entry-price-2120129197">€ 1.099</span>

<span class="Text-sc-10o2fdq-0 cmjxOO">62</span>
<span class="Text-sc-10o2fdq-0 cmjxOO">45</span> */}

// loop over all elements with class="Text-sc-10o2fdq-0 sc-b4c02c1e-3 kncxJj jkHUJf" and get the text content

function updatePricesPerM2(node) {
    const prices = node.querySelectorAll('.Text-sc-10o2fdq-0.sc-b4c02c1e-3.kncxJj.jkHUJf');
    const areas = node.querySelectorAll('.Text-sc-10o2fdq-0.cmjxOO');
    const filteredAreas = Array.from(areas).filter(area => area.closest('[data-testid$="-0"]'));

    for (let i = 0; i < prices.length; i++) {
        let price = prices[i].textContent;
        // remove first two characters from price
        price = price.slice(2);
        price = price.replace('.', ''); // remove . as thousand separator
        price = price.replace(',', '.'); // . as decimal separator
        let area = filteredAreas[i].textContent;

        // convert price and area to numbers
        let priceval = Number(price);
        let areaval = Number(area);
        let pricePerM2 = priceval / areaval;
        // limit to two decimal places
        pricePerM2 = pricePerM2.toFixed(2);

        // create a new element and append it to the parent element
        const newElement = document.createElement('span');
        // change font size to 0.8em
        newElement.style.paddingLeft = '15px';
        newElement.textContent = `€ ${pricePerM2}/m²`;
        prices[i].parentElement.parentElement.appendChild(newElement);
        console.log(prices[i].parentElement.parentElement.children[0].childElementCount);

        // also remove the first childelement (of the prices[i] parent element) (which is the vendor info)
        newElement.parentElement.children[0].remove();
        // could also remove the first childelement's second child (of the prices[i] parent element) (which is the vendor)
        // prices[i].parentElement.parentElement.children[0].remove();
        // if (newElement.parentElement.children[0].children[0].childElementCount == 2) {
        //     newElement.parentElement.children[0].children[0].children[1].remove();
        // }
    }
}

// Initial call to update prices per m² for existing elements
document.querySelectorAll('.Box-sc-wfmb7k-0').forEach((node) => {
    if (node.parentElement && node.parentElement.id === 'skip-to-resultlist') { // only want boxes in the result list
        updatePricesPerM2(node);
    }
});

// Set up a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.classList && node.classList.contains('Box-sc-wfmb7k-0') && node.parentElement.id === 'skip-to-resultlist') {
                updatePricesPerM2(node);
            }
        });
    });
});

// Start observing the target node for configured mutations
observer.observe(document.body, { childList: true, subtree: true });