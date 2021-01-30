import { useState, useCallback } from "react"
import * as Immutable from "immutable";

const useModalStack=() => {
  const [modalsStack, setModalsStack]=useState(Immutable.Stack());
  const currentModal=modalsStack.peek();
  const closeModal=useCallback((modalName) => {
    if(Array.isArray(modalName)){
      setModalsStack(modalsStack => modalsStack.withMutations(stack => {
        for(const name of modalName){
          if(stack.peek()===name) {
            stack.pop();
          }
        }
      }));
    } else if(currentModal===modalName) {
      setModalsStack(modalsStack => modalsStack.pop());
    }
  }, [setModalsStack, currentModal]);
  const openModal=useCallback((modalName) => {
    setModalsStack(modalsStack => modalsStack.push(modalName));
  }, [setModalsStack]);
  return [currentModal, openModal, closeModal]
}

export default useModalStack;