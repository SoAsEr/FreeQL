import { useState, useCallback } from "react"
import * as Immutable from "immutable";

const useModalStack=() => {
  const [modalsStack, setModalsStack]=useState(Immutable.Stack());
  const currentModal=modalsStack.peek();
  const closeModal=useCallback((modalName) => {
    if(Array.isArray(modalName)){
      setModalsStack(modalsStack.withMutations(stack => {
        for(const name of modalName){
          if(stack.peek()===name) {
            stack.pop();
          }
        }
      }));
    } else if(currentModal===modalName) {
      setModalsStack(modalsStack.pop());
    }
  }, [setModalsStack, currentModal, modalsStack]);
  const openModal=useCallback((modalName) => {
    setModalsStack(modalsStack.push(modalName));
  }, [setModalsStack, modalsStack]);
  return [currentModal, openModal, closeModal]
}

export default useModalStack;