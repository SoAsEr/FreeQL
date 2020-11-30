#pragma once

#include <random>
#include <algorithm>
#include <utility>
#include <set>
#include <vector>
#include <queue>
#include <iostream>
//#include <ranges>


//random utilities, 
namespace SM_utils{

    template<typename T>
    using numeric=T;
    //concept numeric=std::integral<T> || std::floating_point<T>;

    template<typename T, /*std::ranges::random_access_range*/typename ContainerType=std::vector<T>>
    class flat_set{
        private:
            ContainerType container;
        public:
            std::size_t size() const{
                return container.size();
            }
            void insert(const T&& t) {
                container.insert(std::lower_bound(container.cbegin(), container.cend(), t), std::move(t));
            }
            void insert(const T& t) {
                container.insert(std::lower_bound(container.cbegin(), container.cend(), t), t);
            }
            void erase(const T& t) {
                container.erase(std::lower_bound(container.cbegin(), container.cend(), t));
            }
            bool contains(const T& t){
                return std::binary_search(container.begin(), container.end(), t);
            }
            
            T* data(){
                return container.data();
            }
            const T* data() const {
                return container.data();
            }
            
            const T& operator[](std::size_t index) const {
                return container[index];
            }
            T& operator[](std::size_t index) {
                return container[index];
            }
            auto begin(){
                return container.begin();
            }
            auto begin() const {
                return container.cbegin();
            }
            auto end(){
                return container.end();
            }
            auto end() const{
                return container.cend();
            }
            auto rbegin(){
                return container.rbegin();
            }
            auto rbegin() const {
                return container.crbegin();
            }
            auto rend(){
                return container.rend();
            }
            auto rend() const{
                return container.crend();
            }
            flat_set(const ContainerType& container_) : container{container_} {}
            flat_set()=default;

    };
    template</*std::ranges::random_access_range*/typename ContainerType, /*std::forward_iterator*/typename const_iterator>
    class NestingIterator{
        public:
            using difference_type = typename const_iterator::difference_type;
            using pointer = typename ContainerType::value_type*;
            using value_type = typename ContainerType::value_type;
            using reference = typename ContainerType::value_type&;
            using iterator_category = typename std::forward_iterator_tag;
        private:
            ContainerType& outerArray;
            const_iterator currentLocation;
        public:
            void operator++(){
                ++currentLocation;
            };
            bool operator!=(NestingIterator const& it) const {
                return currentLocation!=it.currentLocation;
            }
            bool operator==(NestingIterator const& it) const {
                return currentLocation==it.currentLocation;
            }
            typename ContainerType::value_type operator*() const {
                return outerArray[*currentLocation];
            }
        NestingIterator(ContainerType& outerArray_, const_iterator currentLocation_) : 
            outerArray{outerArray_}, 
            currentLocation{currentLocation_} 
            {}
    };
    template<typename T>
    concept priority_queue=requires(T c) { c.top(); c.pop(); c.size();};
    
    template<priority_queue ContainerType>
    class ConsumingIterator{
        private:
            ContainerType& container;
        public:
            ConsumingIterator(ContainerType& container_) : container{container_} {}
            typename ContainerType::value_type operator*() const {
                return container.top();
            }
            void operator++(){
                return container.pop();
            }
            bool operator!=([[maybe_unused]] ConsumingIterator<ContainerType>& end) const {
                return container.size();
            }
    };


    template<priority_queue ContainerType>
    class ConsumingRange{
        private:
            ContainerType& container;
        public:
            ConsumingRange(ContainerType& container_) : container{container_} { }
            
            ConsumingIterator<ContainerType> begin() const {
                return {container};
            }

            ConsumingIterator<ContainerType> end() const {
                return {container};
            }
    };

    //intended usage is to top and pop and then occassionally reinsert numbers that have been already popped (so all numbers inserted are less than max)
    template</*std::integral*/typename T>
    class IncreasingPQ{
        private:
            T max;
            std::priority_queue<T, std::vector<T>, std::greater<T>> reinserted;
        public:
            T top() const {
                if(reinserted.empty()){
                    return max;
                } else {
                    return reinserted.top();
                }
            }
            void pop(){
                if(reinserted.empty()){
                    ++max;
                } else {
                    reinserted.pop();
                }
            }
            void push(T value){
                assert(value<max);
                reinserted.push(value);
            }
            IncreasingPQ(T starting) : max{starting} {}
    };


    class CountingIterator{
        private:
            std::size_t value;
        public:
            using difference_type = std::ptrdiff_t;
            using value_type = std::size_t;
            using pointer = std::size_t*;
            using reference = std::size_t&;
            using iterator_category = std::random_access_iterator_tag;

            explicit CountingIterator(std::size_t initialValue) : value(initialValue){}
            void operator++(){
                ++value;
            };
            void operator+(const std::size_t val){
                value+=val;
            };
            difference_type operator-(const CountingIterator& rhs){
                return value-rhs.value;
            }
            bool operator==(CountingIterator const& it) const {
                return value==it.value;
            }
            bool operator!=(CountingIterator const& it) const {
                //std::cout<<value<<" "<<it.value<<std::endl;
                return value!=it.value;
            }
            std::size_t operator*() const {
                return value;
            }
    };

    template</*std::ranges::random_access_range*/typename ContainerType, typename Compare, /*std::integral*/typename IndexType>
    struct IndexCompare{
        const ContainerType& container;
        const Compare comp=Compare();
        IndexCompare(const ContainerType& container_) : container{container_} { }
        bool operator()(IndexType a, IndexType b) const{
            return comp(container[a], container[b]);
        }
    };


    //template magic? template magic. Of course it's stack overflow. NOTE THAT IT's REVERSED
    //It goes is_base_template<ExpectedDerived, ExpectedBase>
    template <template <typename...> class C, typename...Ts>
    std::true_type is_base_of_template_impl(const C<Ts...>*);

    template <template <typename...> class C>
    std::false_type is_base_of_template_impl(...);

    template <typename T, template <typename...> class C>
    using is_base_of_template = decltype(is_base_of_template_impl<C>(std::declval<T*>()));

    void print_vect(const auto& v){
        for(const auto& elem : v){
            std::cout<<elem<<" ";
        }
        std::cout<<std::endl;
    }
    
}