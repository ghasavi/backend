export default function AviProductCard(props){


    return(
        <div className="avicard">
            <img className="productImage" src="/aviImages/avi01.png"/>
            <h1>{props.name}</h1>
            <p>{props.description}</p>
            <h2>Price: ${props.price}</h2>
            <button className="addToCartButton">Add to Cart</button>
            <button className="buyButton">Buy Now</button>  
        </div>
    )
}