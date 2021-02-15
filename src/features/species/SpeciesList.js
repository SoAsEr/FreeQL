import React, { useState } from 'react';

import FormattedChemicalCompound from '../../reusable_components/formatting/FormattedChemicalCompound.js';

import classNames from "classnames";

import { useDispatch, useSelector } from 'react-redux';
import { addLogKChange, disableSpecies, enableSpecies, removeLogKChange } from './speciesSlice.js';
import { getSpeciesCouldBePresent, getSpeciesDB, getIfSpecieEnabled, getLogKChange } from './speciesSelectors.js';
import { getComponentDB, getComponentsPresent, getWaterValue } from '../components/componentsSelectors.js';
import is_number from 'is-number';
import EditDefault from '../../reusable_components/EditDefault.js';
import {Collapse, Panel} from '../../reusable_components/Collapse.js';


const CheckListContent=React.memo(({label, disabled, onEnable}) => {
  const extraCheckProps = onEnable ? {onChange: onEnable, disabled: false} : {disabled : true, readOnly: true};
  return (
      <div className="flex items-center text-black">
        <input type="checkbox" checked={!disabled} {...extraCheckProps} />
        <label className="flex flex-wrap center-self">
          {label}
        </label>
      </div>
  )
});


const ListItem=({children, className, disabled}) => {
  return (
    <li className={classNames("px-3 py-2 border-r border-l border-t last:border-b last:rounded-b-sm first:rounded-t-sm border-gray-400", {"text-gray-500": disabled}, className)}>
      {children}
    </li>
  )
}

const LogKEditor=({specie, type, disabled}) => {
  const speciesDB=useSelector(getSpeciesDB);
  const dispatch=useDispatch();
  const changedValue=useSelector(state => getLogKChange(state, {specie, type}));
  const defaultValue=speciesDB[type].get(specie).logK;
  return (
    <div className="flex mt-2 justify-around items-center w-full text-sm">
      <div className="px-2">
        <label>logK:</label>
      </div>
      <div className="px-2">
        <EditDefault
          constantValidation={(input) => input.match(/^-?\d*\.?\d*$/)}
          onSubmitValidation={(input) => is_number(input)}
          warnValidation={(input) => Math.sign(input) === Math.sign(defaultValue)}
          defaultValue={defaultValue}
          changedValue={changedValue}
          onEdit={(value) => {
            dispatch(addLogKChange({specie, type, value: Number(value)}));
          }}
          onResetToDefault={() => {
            dispatch(removeLogKChange({specie, type}));
          }}
          inputProps={{
            className: "text-control thin text-center w-full"
          }}
          disabled={disabled}
        />
      </div> 
    </div>
      
  )
}


const SpecieContent=React.memo(({specie, type, disabled}) => {
  const speciesDB=useSelector(getSpeciesDB);
  const dispatch=useDispatch();
  return (
    <>
      <CheckListContent
        label={
          <FormattedChemicalCompound>{speciesDB[type].get(specie).name}</FormattedChemicalCompound>
        }
        disabled={disabled}
        onEnable={(e) => {
          if(e.target.checked) {
            dispatch(enableSpecies({[type]: [specie]}))
          } else {
            dispatch(disableSpecies({[type]: [specie]}))
          }
        }} 
      />  
      <LogKEditor
        specie={specie}
        type={type}
        disabled={disabled}
      />  
    </>  
  )
});
const ComponentPicker=React.memo(({specie, type, disabled, center}) => {
  const speciesDB=useSelector(getSpeciesDB);
  const componentDB=useSelector(getComponentDB);
  const waterValue=useSelector(getWaterValue);
  return (
    <div className="flex flex-wrap">
      {
        Array.from(speciesDB[type].get(specie).components.delete(waterValue).keys()).map(component => (
          <div className={classNames("flex w-1/2", {"justify-center": center})} key={component}>
            <input type="radio" className="mr-1 mt-1.5" disabled={disabled}/>
            <label><FormattedChemicalCompound>{componentDB.components.get(component).name}</FormattedChemicalCompound></label>
          </div>
        ))
      }
    </div>
  )
})
const SolidContent=React.memo(({specie, disabled}) => {
  const [equilibrium, setEquilibrium]=useState(false);
  return (
    <>
      <div>
        <div className="flex">
          <input type="radio" className="mr-2 mt-1.5" disabled={disabled} checked={!equilibrium} onChange={(e) => {setEquilibrium(!e.target.checked);}}/>
          <label className="flex flex-wrap">
            Possible
          </label>
        </div>
        <div className={classNames("flex ml-6", {"text-gray-500": equilibrium})}>
          <input type="checkbox" className="mr-2 mt-1.5" disabled={equilibrium || disabled}/>
          <label className="flex flex-wrap">
            Probably Present
          </label>
        </div>
      </div>
      <div>
        <div className="flex">
          <input type="radio" className="mr-2 mt-1.5" disabled={disabled} checked={equilibrium} onChange={(e) => {setEquilibrium(e.target.checked);}}/>
          <label className="flex flex-wrap">
            Force Equilibrium
          </label>
        </div>
        <div className="ml-6">
          <ComponentPicker
            specie={specie}
            type="solids"
            disabled={!equilibrium || disabled}
          />
        </div>
      </div>      
    </>
  )
});

const AqSpecieListItem=React.memo(({specie}) => {
  const disabled=!useSelector(state => getIfSpecieEnabled(state, {specie, type: "aqs"}));
  return (
    <ListItem disabled={disabled}>
      <SpecieContent
        specie={specie}
        type={"aqs"}
        disabled={disabled}
      />
    </ListItem>
  )
});
const SolidSpecieListItem=React.memo(({specie}) => {
  const disabled=!useSelector(state => getIfSpecieEnabled(state, {specie, type: "solids"}));
  return (
    <ListItem disabled={disabled}>
      <SpecieContent
        specie={specie}
        type={"solids"}
        disabled={disabled}
      />
      <SolidContent
        specie={specie}
        disabled={disabled}
      />
    </ListItem>
  )
});
const GasSpecieListItem=React.memo(({specie}) => {
  const disabled=!useSelector(state => getIfSpecieEnabled(state, {specie, type: "gases"}));
  return (
    <ListItem disabled={disabled}>
      <SpecieContent
        specie={specie}
        type={"gases"}
        disabled={disabled}
      />
      <ComponentPicker
        specie={specie}
        type="gases"
        disabled={disabled}
        center
      />
    </ListItem>
  )
});

const ComponentListItem=React.memo(({component}) => {
  const componentDB=useSelector(getComponentDB);
  return (
    <ListItem>
      <CheckListContent
        label={
          <FormattedChemicalCompound>{componentDB.components.get(component).name}</FormattedChemicalCompound>
        }
        enabled={true}
      />
    </ListItem>
  )
});

const ListHeader=React.memo(({children, expanded, toggleCollapse}) => {
  return (
    <ListItem>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 justify-between items-center">
        <label className="justify-self-start">{children}</label>
        <button className="text-xl font-bold text-gray-700 w-5 text-center justify-self-end" onClick={toggleCollapse}>{expanded ? "-" : "+"}</button>
        {
          expanded &&
          <>
            <button className="btn-primary text-xs w-100">Add All</button>
            <button className="btn-primary text-xs w-100">Remove All</button>
          </>
        }
      </div>
    </ListItem>
  )
})

const SpeciesListGroup=React.memo(() => { 
  const componentsPresent=useSelector(getComponentsPresent);
  const speciesCouldBePresent=useSelector(getSpeciesCouldBePresent);
  const speciesDB=useSelector(getSpeciesDB);
  return(
    <div>
      <ul className="mb-3">
        <Collapse>
          <Panel header={({toggleCollapse, expanded}) =>(
            <ListItem className="flex justify-between items-center">
              <label>Components</label>
              <button className="text-xl font-bold text-gray-700 w-5 text-center" onClick={toggleCollapse}>{expanded ? "-" : "+"}</button>
            </ListItem>
          )}>
            {componentsPresent
              .map((component) => 
                <ComponentListItem 
                  key={component} 
                  component={component}
                />
              )
            }
          </Panel>
        </Collapse>
      </ul>
      <ul className="mb-3">
        <Collapse>
          <Panel header={({toggleCollapse, expanded}) =>(
            <ListHeader
              toggleCollapse={toggleCollapse}
              expanded={expanded}
            >
              Aqueous
            </ListHeader>
          )}>
            {
              speciesCouldBePresent.aqs.sortBy(specie => speciesDB.aqs.get(specie).index)
                .map((specie) => 
                  <AqSpecieListItem 
                  key={specie} 
                  specie={specie}
                />
              )
            }
          </Panel>
        </Collapse>
      </ul>
      <ul className="mb-3">
        {
          !!speciesCouldBePresent.solids.size && 
          <Collapse>
            <Panel expanded header={({toggleCollapse, expanded}) =>(
              <ListHeader
                toggleCollapse={toggleCollapse}
                expanded={expanded}
              >
                Solids
              </ListHeader>
            )}>
              {
                speciesCouldBePresent.solids.sortBy(specie => speciesDB.solids.get(specie).index)
                  .map((specie) => 
                    <SolidSpecieListItem 
                      key={specie} 
                      specie={specie}
                    />
                )
              }
            </Panel>
          </Collapse>
        }
      </ul>
      <ul>
        {
          !!speciesCouldBePresent.gases.size && 
          <Collapse>
            <Panel expanded header={({toggleCollapse, expanded}) =>(
              <ListHeader
                toggleCollapse={toggleCollapse}
                expanded={expanded}
              >
                Gases
              </ListHeader>
            )}>
              {
                speciesCouldBePresent.gases.sortBy(specie => speciesDB.gases.get(specie).index)
                  .map((specie) => 
                    <GasSpecieListItem 
                      key={specie} 
                      specie={specie}
                    />
                )
              }
            </Panel>
          </Collapse>
        }
      </ul>
    </div>
  )
});

const SpeciesList=React.memo(({openTableauModal, ...restProps}) => {
  return(
    <>
      <div>
        <button onClick={openTableauModal} className="text-sm mx-auto border-b-2 border-transparent hover:border-gray-600 flex justify-center items-end">
          View Tableau
          <svg className="bi bi-chevron-double-right mb-0.5" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M3.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L9.293 8 3.646 2.354a.5.5 0 010-.708z" clipRule="evenodd"></path>
            <path fillRule="evenodd" d="M7.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L13.293 8 7.646 2.354a.5.5 0 010-.708z" clipRule="evenodd"></path>
          </svg>
        </button>  
      </div>
      <div>
        <SpeciesListGroup {...restProps}/>
      </div>
    </>
  )
});

export default SpeciesList;