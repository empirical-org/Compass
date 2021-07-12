require 'spec_helper'


RSpec.describe 'integration' do 
  it 'should be a module' do 
    expect(Comprehension).to be_a(Module)
  end
end

