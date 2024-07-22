

const toggleBtnAdd = document.querySelector('#toggle-btnAdd');
const formContainerAddProduct = document.querySelector('#formAddProductConteiner');
toggleBtnAdd.addEventListener('click', () => {
    if (formContainerAddProduct.classList.contains('show')) {
        formContainerAddProduct.classList.remove('show');
        toggleBtnAdd.textContent = 'Agregar Producto - Mostrar Formulario';
    } else {
        formContainerAddProduct.classList.add('show');
        toggleBtnAdd.textContent = 'Agregar Producto - Ocultar Formulario';
    }
});

const toggleBtnUpdate = document.querySelector('#toggle-btnUpdate');
const formContainerUpdateProduct = document.querySelector('#formUpdateProductConteiner');
toggleBtnUpdate.addEventListener('click', () => {
    if (formContainerUpdateProduct.classList.contains('show')) {
        formContainerUpdateProduct.classList.remove('show');
        toggleBtnUpdate.textContent = 'Editar Producto - Mostrar Formulario';
    } else {
        formContainerUpdateProduct.classList.add('show');
        toggleBtnUpdate.textContent = 'Editar Producto - Ocultar Formulario';
    }
});


const toggleBtnDel = document.querySelector('#toggle-btnDel');
const formContainerDelProduct = document.querySelector('#formDelProductConteiner');
toggleBtnDel.addEventListener('click', () => {
    if (formContainerDelProduct.classList.contains('show')) {
        formContainerDelProduct.classList.remove('show');
        toggleBtnDel.textContent = 'Eliminar Producto - Mostrar Formulario';
    } else {
        formContainerDelProduct.classList.add('show');
        toggleBtnDel.textContent = 'Eliminar Producto - Ocultar Formulario';
    }
});

// Funcion para convertir una imagen en base64 para enviarla por medio del POST del form
async function convertBase64(files){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); 
        reader.onerror = reject;
        reader.readAsDataURL(files);
    });
}

const addProductForm = document.querySelector('#addProductForm');
addProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fileInput = document.querySelector('#FileImg');
    const files = fileInput.files;

    let thumbnails = [];

    if (files.length > 0) {
        try {
            const filePromises = Array.from(files).map(async file => {
                const base64Data = await convertBase64(file);
                return {
                    name: file.name,
                    type: file.type,
                    data: base64Data
                };
            });
    
            thumbnails = await Promise.all(filePromises);
        } catch (error) {
            console.error('Error al leer los archivos:', error);
        }
    }

    const product = {
        title: event.target.titleProduct.value,
        description: event.target.descriptionProduct.value,
        code: event.target.codeProduct.value,
        price: event.target.priceProduct.value,
        stock: event.target.stockProduct.value,
        category: event.target.categoryProduct.value
    };

    socket.emit('addProduct', {product, thumbnails});

    event.target.reset();
});


const updateProductForm = document.querySelector('#updateProductForm');
updateProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = event.target.idProductEdit.value;

    const product = {
        title: event.target.titleProductEdit.value,
        description: event.target.descriptionProductEdit.value,
        code: event.target.codeProductEdit.value,
        price: event.target.priceProductEdit.value,
        stock: event.target.stockProductEdit.value,
        category: event.target.categoryProductEdit.value
    };

    socket.emit('updateProduct', {id, product});

    event.target.reset();
});


const deleteProductForm = document.querySelector('#deleteProductForm');
deleteProductForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const productId = event.target.productId.value;

    socket.emit('deleteProduct', productId);

    event.target.reset();
});

socket.on('updateProducts', (data) => {
    const productList = document.querySelector(".row.listProducts");
    productList.innerHTML = '';
    data.products.forEach((product) => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-4 mb-4';

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';

        const rowDiv = document.createElement('div');
        rowDiv.className = 'row no-gutters';

        const colImgDiv = document.createElement('div');
        colImgDiv.className = 'col-md-4';

        const img = document.createElement('img');
        img.src = product.thumbnails[0];
        img.className = 'card-img';
        img.alt = product.title;

        const colBodyDiv = document.createElement('div');
        colBodyDiv.className = 'col-md-8';

        const cardBodyDiv = document.createElement('div');
        cardBodyDiv.className = 'card-body';

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardTitle.textContent = product.title;

        const cardText = document.createElement('p');
        cardText.className = 'card-text';
        cardText.textContent = product.description;

        const listGroup = document.createElement('ul');
        listGroup.className = 'list-group list-group-flush';

        const items = [
            `Código: ${product.code}`,
            `Precio: $${product.price}`,
            `Stock: ${product.stock}`,
            `Categoría: ${product.category}`
        ];

        items.forEach(itemText => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = itemText;
            listGroup.appendChild(listItem);
        });

        colImgDiv.appendChild(img);
        rowDiv.appendChild(colImgDiv);

        cardBodyDiv.appendChild(cardTitle);
        cardBodyDiv.appendChild(cardText);
        cardBodyDiv.appendChild(listGroup);

        colBodyDiv.appendChild(cardBodyDiv);
        rowDiv.appendChild(colBodyDiv);

        cardDiv.appendChild(rowDiv);
        colDiv.appendChild(cardDiv);


        productList.appendChild(colDiv);

        let msj = [];
        switch (data.metodo) {
            case 'agregar':
                msj.push('guardado');
                msj.push('guardar');
                break;
            case 'editar':
                msj.push('editado');
                msj.push('editar');
                break;
            case 'eliminar':
                msj.push('eliminado');
                msj.push('eliminar');
                break;
            default:
                msj.push('undefinde');
                msj.push('undefinde');
                break;
        }

        if (data.result){
            Swal.fire({
                icon: "success",
                title: `Producto ${msj[0]} correctamente!!`,
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            Swal.fire({
                icon: "error",
                title: `Error al ${msj[1]} producto!!`,
                showConfirmButton: false,
                timer: 1500
            });
        }   
    });
});
