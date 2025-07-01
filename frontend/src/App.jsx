import './App.css'
import Header from './components/header'
import AviProductCard from './components/aviproductCard'

function App() {
  
  return (
    <>
      <Header></Header>
      <AviProductCard name ="Jinu" description="This is a product description" price="1000" picture="/aviImages/avi01.png">

      </AviProductCard>
    </>
  )
}

export default App
