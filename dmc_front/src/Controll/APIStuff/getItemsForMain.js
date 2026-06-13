const api_url = "http://127.0.0.1:8000"

const sort_order = {'Desc': 1,'Asc': 2}


export async function getItemsRequest(_limit=20,_offset=0,_order="desc",_sort="date"){
    const params = new URLSearchParams({
        limit : _limit,
        offset : _offset,
        sort: _sort,
        order : _order
    })

    const response = await fetch(`${api_url}/?${params.toString()}`, {
        method: 'GET',
        headers:{"Content-Type":"application/json"},})

    if (!response.ok){
        throw new Error("Ошибка загрузки товаров")
    }

    return await response.json()
}