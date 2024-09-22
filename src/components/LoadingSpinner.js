import {Spinner} from "react-bootstrap";

export const LoadingSpinner = () => {
    return <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </div>
}