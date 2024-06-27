import React, { ReactElement } from "react";
import { hey } from './module2';
//Define the Dog component and explicitly type it as ReactElement
export const Dog2= (): ReactElement => {
    return (
        <React.Fragment>
            <hey></hey>
        </React.Fragment>
    );
};




export default Dog2;