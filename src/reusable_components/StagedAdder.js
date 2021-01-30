import React, { useState, useMemo } from "react";
import * as Immutable from "immutable";

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';

import List from "react-virtualized/dist/commonjs/List";
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';

export default ({items, filterFn, rowLabelCreator, onConfirm, onCancel, height, Body, Footer}) => {
  const [searchValue, setSearchValue]=useState("");
  const [itemsStaged, setItemsStaged]=useState(Immutable.OrderedSet());
  const filteredIndexedSeq=useMemo(() => {
    return items.filter(item => filterFn(item, searchValue));
  }
  , [searchValue, items, filterFn]);
  const reset=() => {
    setSearchValue("");
    setItemsStaged(Immutable.OrderedSet());
  }
  return (
    <>
      <Body>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>
              <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/>
                <path fillRule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
              </svg>
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            placeholder="Search"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            className="sticky-top"
          />
          {
            searchValue && 
            <svg
              onClick={() => {
                setSearchValue("")
              }} 
              width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x-circle-fill search-clearer" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
            </svg>
          }
        </InputGroup>
        <AutoSizer disableHeight>
        {({width}) => <List 
          width={width} 
          height={height}
          rowHeight={43}
          overscanRowCount={10}
          rowRenderer={({index, key, style}) => {
            const item=filteredIndexedSeq.get(index);
            const isStaged=itemsStaged.includes(item);
            return (
              <div key={item} style={style} className="p-2 d-flex align-items-center">
                {rowLabelCreator(item)}
                <Button onClick={() => {
                    if(isStaged){
                      setItemsStaged(itemsStaged => itemsStaged.delete(item));
                    } else {
                      setItemsStaged(itemsStaged => itemsStaged.add(item));
                    }
                  }}
                  variant={isStaged ? "secondary" : "primary"} size="sm">{isStaged ? "Cancel" : "Add"}
                </Button>
              
              </div>
            )
          }}
          rowCount={filteredIndexedSeq.count()}
        />}
      </AutoSizer>
    </Body>
    <Footer>
      <Button
        variant="primary"
        onClick={() => {
          reset();
          if(itemsStaged.size){
            onConfirm(itemsStaged.toIndexedSeq());
          } else {
            onCancel();
          }
        }}
      >
        {itemsStaged.size ? "Apply" : "Cancel"}
      </Button>
    </Footer>
  </>
  )
}