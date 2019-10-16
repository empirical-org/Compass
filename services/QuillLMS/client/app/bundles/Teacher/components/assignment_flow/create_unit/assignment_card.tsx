import * as React from 'react'

interface AssignmentCardProps {
  link?: string;
  imgSrc: string;
  imgAlt: string;
  header: string;
  bodyArray: Array<{ key: string, text: string }>;
  buttonText?: string;
  buttonLink?: string;
}

const AssignmentCard = ({ link, imgSrc, imgAlt, header, bodyArray, buttonText, buttonLink}: AssignmentCardProps) => {
  const button = buttonText && buttonLink ? <a className="quill-button medium outlined secondary" target="_blank" href={buttonLink}>{buttonText}</a> : null
  const bodyElements = bodyArray.map(obj => (
    <div className="body-element">
      <p className="key">{obj.key}</p>
      <p className="text">{obj.text}</p>
    </div>)
  )
  return (<a href={link} className="assignment-card quill-card">
    <div className="top-row">
      <div className="left">
        <img src={imgSrc} alt={imgAlt} />
        <h2>{header}</h2>
      </div>
      {button}
    </div>
    <div className="body">
      {bodyElements}
    </div>
  </a>)
}

export default AssignmentCard
