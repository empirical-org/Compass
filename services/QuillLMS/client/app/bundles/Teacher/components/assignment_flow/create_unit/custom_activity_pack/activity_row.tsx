import * as React from 'react';

import { Activity, ActivityClassification, } from './interfaces'

const smallWhiteCheckSrc = `${process.env.CDN_URL}/images/shared/check-small-white.svg`
const expandSrc = `${process.env.CDN_URL}/images/shared/expand.svg`
const conceptSrc = `${process.env.CDN_URL}/images/icons/description-concept.svg`
const ccssSrc = `${process.env.CDN_URL}/images/icons/description-ccss.svg`
const readabilitySrc = `${process.env.CDN_URL}/images/icons/description-readability.svg`
const informationSrc = `${process.env.CDN_URL}/images/icons/description-information.svg`
const copyrightSrc = `${process.env.CDN_URL}/images/icons/description-copyright.svg`
const previewSrc = `${process.env.CDN_URL}/images/icons/preview.svg`
const removeSrc = `${process.env.CDN_URL}/images/icons/remove-in-circle.svg`
const connectSrc = `${process.env.CDN_URL}/images/icons/description-connect.svg`
const diagnosticSrc = `${process.env.CDN_URL}/images/icons/description-diagnostic.svg`
const lessonsSrc = `${process.env.CDN_URL}/images/icons/description-lessons.svg`
const proofreaderSrc = `${process.env.CDN_URL}/images/icons/description-proofreader.svg`
const grammarSrc = `${process.env.CDN_URL}/images/icons/description-grammar.svg`

interface ActivityRowCheckboxProps {
  activity: Activity,
  isSelected: boolean,
  toggleActivitySelection: (activity: Activity, isSelected: boolean) => void
}

interface ActivityRowProps {
  activity: Activity,
  isSelected: boolean,
  isFirst: boolean,
  toggleActivitySelection: (activity: Activity, isSelected: boolean) => void,
  showCheckbox?: boolean,
  showRemoveButton?: boolean,
  setShowSnackbar?: (show: boolean) => void
}

const imageTagForClassification = (classificationKey: string): JSX.Element => {
  let imgAlt = ""
  let imgSrc
  switch(classificationKey) {
    case 'connect':
      imgAlt = "Target representing Quill Connect"
      imgSrc = connectSrc
      break
    case 'diagnostic':
      imgAlt = "Magnifying glass representing Quill Diagnostic"
      imgSrc = diagnosticSrc
      break
    case 'grammar':
      imgAlt = "Puzzle piece representing Quill Grammar"
      imgSrc = grammarSrc
      break
    case 'lessons':
      imgAlt = "Apple representing Quill Lessons"
      imgSrc = lessonsSrc
      break
    case 'proofreader':
      imgAlt = "Flag representing Quill Proofreader"
      imgSrc = proofreaderSrc
      break
  }

  return <img alt={imgAlt} src={imgSrc} />
}

const ActivityRowCheckbox = ({ activity, isSelected, toggleActivitySelection, }: ActivityRowCheckboxProps) => {
  const handleCheckboxClick = () => toggleActivitySelection(activity, isSelected)
  if (isSelected) {
    return <button className="quill-checkbox focus-on-light selected" onClick={handleCheckboxClick} type="button"><img alt="check" src={smallWhiteCheckSrc} /></button>
  }

  return <button aria-label="unchecked checkbox" className="quill-checkbox focus-on-light unselected" onClick={handleCheckboxClick} type="button" />
}

const ActivityRowClassification = ({ classification, }: { classification?: ActivityClassification }) => {
  const className = "second-line-section classification"
  if (classification) {
    return (<span className={className}>
      {imageTagForClassification(classification.key)}
      <span>{classification.alias}</span>
    </span>)
  }

  return <span className={className} />
}

const ActivityRowConcept = ({ conceptName, }: { conceptName?: string }) => {
  const className = "second-line-section concept"
  if (conceptName) {
    return (<span className={className}>
      <img alt="Pencil writing icon" src={conceptSrc} />
      <span>{conceptName}</span>
    </span>)
  }

  return <span className={className} />
}

const ActivityRowStandardLevel = ({ standardLevelName, }: { standardLevelName?: string }) => {
  const className = "second-line-section standard-level"
  if (standardLevelName) {
    return (<span className={className}>
      <img alt="Common Core State Standards icon" src={ccssSrc} />
      <span>{standardLevelName}</span>
    </span>)
  }

  return <span className={className} />
}

const ActivityRowExpandedSection = ({ activity, isExpanded}: { activity: Activity, isExpanded: boolean }) => {
  if (!isExpanded) { return <span />}

  const descriptionLine = activity.description && (<div className="expanded-line">
    <img alt="Information icon" src={informationSrc} />
    <span>{activity.description}</span>
  </div>)

  const contentPartnerLines = activity.content_partners && activity.content_partners.map(cp => (
    <div className="expanded-line" key={cp.id}>
      <img alt="Copyright icon" src={copyrightSrc} />
      <span>{cp.description}</span>
    </div>)
  )

  return (<React.Fragment>
    {descriptionLine}
    {contentPartnerLines}
  </React.Fragment>)
}

const ActivityRowTooltip = ({ activity, showTooltip}: { activity: Activity, showTooltip: boolean }) => {
  if (!showTooltip) { return <span />}

  const descriptionLine = activity.description && (<div className="tooltip-line">
    <img alt="Information icon" src={informationSrc} />
    <span>{activity.description}</span>
  </div>)

  const contentPartnerLines = activity.content_partners && activity.content_partners.map(cp => (
    <div className="tooltip-line" key={cp.id}>
      <img alt="Copyright icon" src={copyrightSrc} />
      <span>{cp.description}</span>
    </div>)
  )

  return (<div className="activity-row-tooltip">
    {descriptionLine}
    {contentPartnerLines}
  </div>)
}

const ActivityRow = ({ activity, isSelected, toggleActivitySelection, showCheckbox, showRemoveButton, isFirst, setShowSnackbar}: ActivityRowProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [showTooltip, setShowTooltip] = React.useState(false)

  function toggleIsExpanded() { setIsExpanded(!isExpanded) }
  function toggleShowTooltip() { setShowTooltip(!showTooltip)}
  function removeActivity() {
    toggleActivitySelection(activity, isSelected)
    setShowSnackbar && setShowSnackbar(true)
  }

  const expandImgAltText = `Arrow pointing ${isExpanded ? 'up' : 'down'}`

  const { activity_classification, name, activity_category_name, standard_level_name, anonymous_path, } = activity

  const previewButton = <a className="interactive-wrapper focus-on-light preview-link" href={anonymous_path} rel="noopener noreferrer" target="_blank"><img alt="Preview eye icon" src={previewSrc} />Preview</a>
  const expandButton = <button className="interactive-wrapper focus-on-light expand-button" onClick={toggleIsExpanded} type="button"><img alt={expandImgAltText} src={expandSrc} /></button>
  const removeButton = <button className="interactive-wrapper focus-on-light remove-button" onClick={removeActivity} type="button"><img alt="Remove icon" src={removeSrc} />Remove</button>
  const removeOrPreviewButton = showRemoveButton ? removeButton : previewButton

  const expandClassName = isExpanded ? 'expanded' : 'not-expanded'
  const isSelectedClassName = isSelected ? 'selected' : 'not-selected'
  const isFirstClassName = isFirst ? 'is-first' : ''

  const mobileOnly = showRemoveButton ? <div className="mobile-only">{removeButton}</div> : null

  return (<section className={`activity-row ${expandClassName} ${isSelectedClassName} ${isFirstClassName}`}>
    <ActivityRowTooltip activity={activity} showTooltip={showTooltip} />
    <div className="first-line">
      <div className="name-and-checkbox-wrapper">
        {showCheckbox && <ActivityRowCheckbox activity={activity} isSelected={isSelected} toggleActivitySelection={toggleActivitySelection} />}
        <button className="interactive-wrapper" onMouseEnter={toggleShowTooltip} onMouseLeave={toggleShowTooltip} tabIndex={-1} type="button"><h2>{name}</h2></button>
      </div>
      <div className="buttons-wrapper">
        {removeOrPreviewButton}
        {expandButton}
      </div>
    </div>
    <div className="second-line">
      <div className="classification-concept-topic-wrapper">
        <ActivityRowClassification classification={activity_classification} />
        <ActivityRowConcept conceptName={activity_category_name} />
        <span className="second-line-section topic" />
      </div>
      <div className="readability-and-standard-level-wrapper">
        <span className="second-line-section readability" />
        <ActivityRowStandardLevel standardLevelName={standard_level_name} />
      </div>
    </div>
    <ActivityRowExpandedSection activity={activity} isExpanded={isExpanded} />
    {mobileOnly}
  </section>)
}

ActivityRow.defaultProps = {
  showCheckbox: true
}

export default ActivityRow