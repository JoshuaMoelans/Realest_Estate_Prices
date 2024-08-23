{/* We hope that these classes are static, else detecting the elements becomes tricky
    
<span class="Text-sc-10o2fdq-0 sc-b4c02c1e-3 kncxJj jkHUJf" data-testid="search-result-entry-price-1714464299">€ 393</span>
<span class="Text-sc-10o2fdq-0 sc-b4c02c1e-3 kncxJj jkHUJf" data-testid="search-result-entry-price-2120129197">€ 1.099</span>

<span class="Text-sc-10o2fdq-0 cmjxOO">62</span>
<span class="Text-sc-10o2fdq-0 cmjxOO">45</span> */}

// loop over all elements with class="Text-sc-10o2fdq-0 sc-b4c02c1e-3 kncxJj jkHUJf" and get the text content

function updatePricesPerM2(node) {
    let prices;
    let areas;
    if (site == "willhaben"){
        prices = node.querySelectorAll('.Text-sc-10o2fdq-0.sc-b4c02c1e-3.kncxJj.jkHUJf');
        areas = node.querySelectorAll('.Text-sc-10o2fdq-0.cmjxOO');
        site = "willhaben";
    }else if (site == "immoweb"){
        // find all <p> tags with class 'card--result__price'
        prices = node.querySelectorAll('.card--result__price');
        areas = node.querySelectorAll('.card__information.card--result__information.card__information--property');
        site = "immoweb";
    }

    for (let i = 0; i < prices.length; i++) {
        let price;
        let area;
        if (site == "willhaben"){
            price = prices[i].textContent;
            // remove first two characters from price
            price = price.slice(2);
            price = price.replace('.', ''); // remove . as thousand separator
            price = price.replace(',', '.'); // . as decimal separator
            area = areas[i].textContent;
        }else if (site == "immoweb"){
            const priceElement = prices[i].querySelector('span[aria-hidden="true"]');
            if(priceElement){
                price = priceElement.textContent;
                price = price.replace('€', '');
                price = price.replace(',', ''); // remove , as thousand separator
                // see if there is a / in the price; if there is, cut off the part after the /
                if (price.includes('/')){ // format '€1,150/month'
                    price = price.split('/')[0];
                }else if (price.includes('(+')){ // format '€965 (+ €113)'
                    // Use a regular expression to extract the main price and the additional price
                    const priceMatch = price.match(/(\d+)[^\d]+€(\d+)/);
                    if (priceMatch) {
                        // Extract the main price and the additional price
                        let mainPrice = priceMatch[1];
                        let additionalPrice = priceMatch[2];

                        // Convert the prices to numbers
                        mainPrice = Number(mainPrice.replace(',', '').replace('.', ','));
                        additionalPrice = Number(additionalPrice.replace(',', '').replace('.', ','));

                        // Sum the prices if needed
                        price = mainPrice + additionalPrice;
                    }
                }
            }
            area = areas[i].innerText; // format "'3 bdr. \n3 bedrooms\n· 95 m²\nsquare meters'" 
            area = area.split('·')[1]; // split the string at the dot and take the second part
            if(!area){
                continue;
            }
            // remove everything after the m² (including the m²)
            area = area.split('m²')[0];
        }

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
        if(site == "willhaben"){
            prices[i].parentElement.parentElement.appendChild(newElement);
        }else if(site == "immoweb"){
            areas[i].appendChild(newElement);
        }
        console.log(prices[i].parentElement.parentElement.children[0].childElementCount);

        // also remove the first childelement (of the prices[i] parent element) (which is the vendor info)
        if(site == "willhaben"){
            newElement.parentElement.children[0].remove();
        }
        // could also remove the first childelement's second child (of the prices[i] parent element) (which is the vendor)
        // prices[i].parentElement.parentElement.children[0].remove();
        // if (newElement.parentElement.children[0].children[0].childElementCount == 2) {
        //     newElement.parentElement.children[0].children[0].children[1].remove();
        // }
    }
}

let loaded_site = window.location.href;
let site = "";
if (loaded_site.indexOf("willhaben.at") != -1) {
    site = "willhaben";
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

}else if (loaded_site.indexOf("immoweb.be") != -1) {
    site = "immoweb";

    // Function to update prices per m² for all elements with the specified class
    const updateAllPrices = () => {
        document.querySelectorAll('.search-results__item').forEach((node) => {
            updatePricesPerM2(node);
        });
    };

    // Initial call to update prices per m² for existing elements
    updateAllPrices();
    
    // Set up a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('.search-results__item')){
                    updatePricesPerM2(node);
                }});
        });
    });
    
    // Start observing the target node for configured mutations
    observer.observe(document.body, { childList: true, subtree: true });

    // Add event listeners to filter buttons to update prices when filters are applied
    // TODO fix this; currently €/m² is not updated when filters are applied (should do this by detecting click?/change in DOM?)
    document.querySelectorAll('quick-filter').forEach((button) => {
        button.addEventListener('click', () => {
            // wait for the results to load
            setTimeout(() => {
                updateAllPrices();
            }, 3000);
        });
    });
}