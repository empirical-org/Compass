require 'rails_helper'

describe Concept, :type => :model do
  describe 'can behave like an uid class' do
    context 'when behaves like uid' do
      it_behaves_like 'uid'
    end
  end

  describe '.leaf_nodes' do
    let!(:root_concept) { FactoryGirl.create(:concept, name: 'root') }
    let!(:leaf1) { FactoryGirl.create(:concept, name: 'leaf1', parent: root_concept)}
    let!(:mid_level_concept) { FactoryGirl.create(:concept, name: 'mid', parent: root_concept)}
    let!(:leaf2) { FactoryGirl.create(:concept, name: 'leaf2', parent: mid_level_concept)}

    subject do
      Concept.leaf_nodes
    end

    it 'finds all the concepts that are leaf nodes in the tree (no children)' do
      expect(subject.size).to eq(2)
    end

    it 'finds the right concepts' do
      expect(subject.map(&:name)).to match(['leaf1', 'leaf2'])
    end
  end
end