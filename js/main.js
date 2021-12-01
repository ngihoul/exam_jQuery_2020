$(() => {
  // CONSTANCES & VARIABLES
  const HEADERS_ARTICLES = ["Marque", "Nom", "Prix", "Actions"];
  const $ARTICLES_TABLE = $("#articles");
  const $ORDER_TABLE = $("#commande");
  const AJAX_LOADER =
    '<tbody><tr><td><img class="d-block mx-auto m-4" src="img/ajax-loader.gif" alt="loader"/></td></tr></tbody>';
  const AJAX_URL = "read_all_articles.php";
  const AJAX_DATATYPE = "JSON";
  const ERROR = {
    notFound: "Source indisponible",
  };
  // LIBRARY
  const Articles = {
    getAll() {
      return new Promise((resolve, reject) => {
        $.get({
          url: AJAX_URL,
          dataType: AJAX_DATATYPE,
          beforeSend: () => {
            $ARTICLES_TABLE.html(AJAX_LOADER);
          },
          success: (datas) => {
            resolve(datas);
          },
          error: (error) => {
            reject(error);
          },
          timeout: 5000,
        });
      });
    },

    displayInTable(location, headers, datas) {
      location.text("");
      // thead
      location.append($("<thead>").append($("<tr>")));
      headers.forEach((label) => {
        $("<th>").text(label).appendTo(location.find("tr"));
      });
      // tbody
      location.append($("<tbody>"));
      datas.forEach((data) => {
        let $tr = $("<tr>");
        Object.values(data).forEach((value) => {
          if (data.id !== value) {
            $tr.append($("<td>").text(value));
          }
        });
        $tr.append(
          $("<td>").append(
            $("<button>", {
              text: "Ajouter",
              class: "btn btn-primary",
              click: (e) => {
                e.preventDefault;
                Order.insertArticle($ORDER_TABLE, data);
              },
            })
          )
        );
        location.children("tbody").append($tr);
      });
    },

    delete(id) {

    },

    sort() {
      const $ARTICLES_TH = $("#articles th").not($("#articles th").last()),
        $ARTICLES_TBODY = $("#articles tbody"),
        $ARTICLES_TR = $("#articles tr").not($("#articles tr").first());

      $ARTICLES_TH.on("click", (e) => {
        let rows = Array.from($ARTICLES_TR).sort(
          compare(
            Array.from($ARTICLES_TH).indexOf(e.target),
            (this.asc = !this.asc)
          )
        );
        rows.forEach((tr) => $ARTICLES_TBODY.append(tr));
      });
    },
  };

  const Order = {
    current: [],

    insertArticle(location, datas) {
      if (Order.isAlreadyOrdered(datas.id) === false) {
        location.children("tbody").append($("<tr>"));
        Object.values(datas).forEach((value) => {
          if (datas.id !== value) {
            location.find("tbody > tr:last").append(
              $("<td>", {
                text: value,
                attr: {
                  "data-id": datas.id,
                },
              })
            );
          }
        });
        location.find($(`td[data-id=${datas.id}]:last`)).addClass("prix");
        Order.current.push(datas);
        let articleIndex = Order.articleIndex(datas.id);
        Order.current[articleIndex].quantite = 1;
        location.find("tbody > tr:last").append(
          $("<td>", {
            text: "-",
            attr: {
              "data-id": datas.id,
            },
            click: (e) => {
              e.preventDefault;
              Order.decreaseQuantity(datas.id);
            },
          }),
          $("<td>", {
            text: Order.current[articleIndex].quantite,
            class: "quantite",
            attr: {
              "data-id": datas.id,
            },
          }),
          $("<td>", {
            text: "+",
            attr: {
              "data-id": datas.id,
            },
            click: (e) => {
              e.preventDefault;
              Order.increaseQuantity(datas.id);
            },
          }),
          $("<td>", {
            text: (Order.current[articleIndex].quantite * datas.prix).toFixed(
              2
            ),
            class: "sous-total",
            attr: {
              "data-id": datas.id,
            },
          })
        );
        Order.updateSubTotal(datas.id);
      } else {
        let articleIndex = Order.articleIndex(datas.id);
        Order.increaseQuantity(datas.id);
        Order.current[articleIndex].quantite++;
      }
    },

    isAlreadyOrdered(id) {
      let orderSize = Order.current.length;
      if (orderSize !== 0) {
        for (let i = 0; i < orderSize; i++) {
          if (Order.current[i].id === id) {
            return true;
          }
        }
      }
      return false;
    },

    articleIndex(id) {
      for (let i = 0, orderSize = Order.current.length; i < orderSize; i++) {
        if (Order.current[i].id === id) {
          return i;
        }
      }
    },

    increaseQuantity(id) {
      let qtyContainer = $(`#commande .quantite[data-id=${id}]`);
      let quantity = parseFloat(qtyContainer.text());
      quantity++;
      qtyContainer.text(quantity);
      Order.updateSubTotal(id);
    },

    decreaseQuantity(id) {
      let qtyContainer = $(`#commande .quantite[data-id=${id}]`);
      let quantity = parseFloat(qtyContainer.text());
      if (quantity > 0) {
        quantity--;
      }
      qtyContainer.text(quantity);
      Order.updateSubTotal(id);
    },

    updateSubTotal(id) {
      let subTotalContainer = $(`#commande .sous-total[data-id=${id}]`);
      let price = parseFloat($(`#commande .prix[data-id=${id}]`).text());
      let quantity = parseInt($(`#commande .quantite[data-id=${id}]`).text());
      let subTotal = (price * quantity).toFixed(2);
      subTotalContainer.text(subTotal);
      Order.updateTotal();
    },

    updateTotal() {
      let totalContainer = $("#commande .total");
      let subTotals = $("#commande .sous-total");
      let finalTotal = 0;
      for (let i in subTotals) {
        if (subTotals[i].textContent) {
          finalTotal += parseFloat(subTotals[i].textContent);
        }
      }
      totalContainer.text(finalTotal.toFixed(2));
    },
  };
  // UTILITIES
  const compare = (ids, asc) => (row1, row2) => {
    const tdValue = (row, ids) => row.children[ids].textContent;
    const tri = (v1, v2) =>
      v1 !== "" && v2 !== "" && !isNaN(v1) && !isNaN(v2)
        ? v1 - v2
        : v1.toString().localeCompare(v2);
    return tri(
      tdValue(asc ? row1 : row2, ids),
      tdValue(asc ? row2 : row1, ids)
    );
  };
  // SCRIPT
  Articles.getAll()
    .then((datas) => {
      Articles.displayInTable($ARTICLES_TABLE, HEADERS_ARTICLES, datas);
      Articles.sort();
    })
    .catch(() => {
      $ARTICLES_TABLE.html(
        `<tbody><tr><td>${ERROR.notFound}</tbody></tr></td>`
      );
    });
});
